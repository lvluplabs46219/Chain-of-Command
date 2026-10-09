"""
Acquit Platform - Enhanced TaskBot Automation Layer
Handles repetitive tasks, data formatting, multi-LLM broadcast operations,
and consensus calculation with security guards.

NEW: Full consensus implementation with semantic similarity
- 5 consensus strategies: semantic, exact, keyword, majority, cluster
- Embedding-based semantic similarity for free-text responses
- Configurable thresholds per strategy
- Detailed similarity reporting
"""

import os
import numpy as np
from typing import Dict, Any, Optional, List, Callable, Tuple
from dataclasses import dataclass, field
from enum import Enum
import re
import logging

from security.permissions import SensitivityLevel, PermissionGuard, PermissionDeniedError
from .llm_router import LLMRouter
from .template_engine import TemplateEngine, TemplateEngineFactory

logger = logging.getLogger(__name__)


# =============================================================================
# Consensus Engine (Embedded in TaskBot for convenience)
# =============================================================================

class ConsensusStrategy(str, Enum):
    """Supported consensus calculation strategies."""
    SEMANTIC = "semantic"      # Embedding-based similarity (for free-text)
    EXACT = "exact"           # Exact string matching (for structured outputs)
    KEYWORD = "keyword"       # Jaccard similarity on token sets
    MAJORITY = "majority"     # Simple majority vote
    CLUSTER = "cluster"       # Largest cluster of similar responses


class ConsensusStatus(str, Enum):
    """Result status of consensus calculation."""
    ACHIEVED = "achieved"
    FAILED = "failed"
    PARTIAL = "partial"


@dataclass
class SimilarityResult:
    """Result of comparing two responses."""
    response_a: str
    response_b: str
    similarity: float  # 0.0 to 1.0
    strategy: ConsensusStrategy


@dataclass
class ConsensusResult:
    """Complete result of consensus calculation."""
    status: ConsensusStatus
    strategy: ConsensusStrategy
    threshold: float
    score: float  # Overall consensus score (0.0 to 1.0)
    consensus_text: Optional[str]  # The agreed-upon response
    all_responses: List[str]
    all_raw_responses: List[Dict[str, Any]]  # Full response objects
    similarity_matrix: Optional[List[List[float]]] = None
    clusters: Optional[List[List[int]]] = None
    pair_similarities: Optional[List[SimilarityResult]] = None
    error: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


class EmbeddingModel:
    """
    Wrapper for embedding models with fallback.
    
    Usage:
        model = EmbeddingModel()
        embeddings = model.encode(["text1", "text2", "text3"])
        
    Environment Variables:
        - USE_MOCK_EMBEDDINGS: Set to "false" to use real embeddings (default: "true" for safety)
        - EMBEDDING_MODEL: Model name to use (default: "all-MiniLM-L6-v2")
    """
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2", auto_init: bool = True):
        self.model_name = model_name
        self._model = None
        # Check environment variable - default to True for safety, but allow production override
        use_mock_env = os.getenv('USE_MOCK_EMBEDDINGS', 'true').lower()
        self._use_mock = use_mock_env == 'true'
        
        if auto_init and not self._use_mock:
            self._initialize_real_model()
    
    def _initialize_real_model(self):
        """Initialize the real embedding model."""
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                self._model = SentenceTransformer(self.model_name)
                logger.info(f"Embedding model initialized: {self.model_name}")
            except ImportError:
                logger.error("sentence-transformers not installed. Falling back to mock embeddings.")
                self._use_mock = True
            except Exception as e:
                logger.error(f"Failed to initialize embedding model: {e}. Falling back to mock.")
                self._use_mock = True
    
    def encode(self, texts: List[str]) -> np.ndarray:
        """
        Encode texts into embeddings.
        
        Args:
            texts: List of text strings
            
        Returns:
            Numpy array of shape [n_texts, embedding_dim]
        """
        if self._use_mock:
            logger.warning(
                "Using mock embedding model. For production, install sentence-transformers "
                "and set USE_MOCK_EMBEDDINGS=false"
            )
            return self._mock_encode(texts)
        else:
            return self._real_encode(texts)
    
    def _mock_encode(self, texts: List[str]) -> np.ndarray:
        """
        Mock encoding for testing.
        
        In production, replace with actual embedding model:
        ```python
        from sentence_transformers import SentenceTransformer
        self._model = SentenceTransformer(self.model_name)
        return self._model.encode(texts)
        ```
        """
        logger.warning(
            "Using mock embedding model. For production, install sentence-transformers: "
            "pip install sentence-transformers"
        )
        # Generate deterministic mock embeddings based on text hash
        embeddings = []
        for text in texts:
            # Simple hash-based mock embedding
            import hashlib
            hash_val = int(hashlib.md5(text.encode()).hexdigest(), 16)
            # Generate a 384-dim vector (same as all-MiniLM-L6-v2)
            np.random.seed(hash_val % (2**32))
            embedding = np.random.randn(384).astype(np.float32)
            embeddings.append(embedding)
        return np.array(embeddings)
    
    def _real_encode(self, texts: List[str]) -> np.ndarray:
        """Real encoding using SentenceTransformer."""
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
                self._model = SentenceTransformer(self.model_name)
            except ImportError:
                logger.error("sentence-transformers not installed. Using mock.")
                self._use_mock = True
                return self._mock_encode(texts)
        return self._model.encode(texts)


class ConsensusEngine:
    """
    Engine for calculating consensus among multiple LLM responses.
    
    Supports multiple strategies for determining if responses "agree":
    - semantic: Uses embedding similarity (best for free-text)
    - exact: Requires exact string match (best for structured outputs)
    - keyword: Uses Jaccard similarity on token sets
    - majority: Simple majority vote (best for multiple-choice)
    - cluster: Finds largest cluster of similar responses
    
    Example:
        engine = ConsensusEngine(strategy=ConsensusStrategy.SEMANTIC, threshold=0.7)
        result = engine.calculate(responses=["answer 1", "answer 2", "answer 3"])
        if result.status == ConsensusStatus.ACHIEVED:
            print(f"Consensus: {result.consensus_text}")
            
    Production Note:
        For semantic strategies, ensure USE_MOCK_EMBEDDINGS=false and 
        sentence-transformers is installed: pip install sentence-transformers
    """
    
    def __init__(
        self,
        strategy: ConsensusStrategy = ConsensusStrategy.SEMANTIC,
        threshold: float = 0.7,
        embedding_model: Optional[EmbeddingModel] = None
    ):
        """
        Initialize the consensus engine.
        
        Args:
            strategy: The consensus calculation strategy to use
            threshold: Minimum similarity score for consensus (0.0 to 1.0)
            embedding_model: Embedding model for semantic strategies
        """
        self.strategy = strategy
        self.threshold = threshold
        self.embedding_model = embedding_model or EmbeddingModel()
        
        # Warn if using mock embeddings for semantic strategies
        if strategy == ConsensusStrategy.SEMANTIC and self.embedding_model._use_mock:
            logger.warning(
                "Semantic consensus using mock embeddings. Set USE_MOCK_EMBEDDINGS=false "
                "for production consensus calculations."
            )

    def calculate(
        self,
        responses: List[str],
        raw_responses: Optional[List[Dict[str, Any]]] = None,
        strategy: Optional[ConsensusStrategy] = None
    ) -> ConsensusResult:
        """
        Calculate consensus among multiple responses.
        
        Args:
            responses: List of response strings to evaluate
            raw_responses: Optional list of full response objects for metadata
            strategy: Override the default strategy for this calculation
            
        Returns:
            ConsensusResult with status and details
        """
        if len(responses) < 1:
            return ConsensusResult(
                status=ConsensusStatus.FAILED,
                strategy=self.strategy,
                threshold=self.threshold,
                score=0.0,
                consensus_text=None,
                all_responses=responses,
                all_raw_responses=raw_responses or [],
                error="At least 1 response required for consensus"
            )
        
        if len(responses) == 1:
            # Single response is trivially consensus
            return ConsensusResult(
                status=ConsensusStatus.ACHIEVED,
                strategy=self.strategy,
                threshold=self.threshold,
                score=1.0,
                consensus_text=responses[0],
                all_responses=responses,
                all_raw_responses=raw_responses or [],
                metadata={"single_response": True}
            )
        
        actual_strategy = strategy or self.strategy
        
        if actual_strategy == ConsensusStrategy.SEMANTIC:
            return self._calculate_semantic_consensus(responses, raw_responses)
        elif actual_strategy == ConsensusStrategy.EXACT:
            return self._calculate_exact_consensus(responses, raw_responses)
        elif actual_strategy == ConsensusStrategy.KEYWORD:
            return self._calculate_keyword_consensus(responses, raw_responses)
        elif actual_strategy == ConsensusStrategy.MAJORITY:
            return self._calculate_majority_consensus(responses, raw_responses)
        elif actual_strategy == ConsensusStrategy.CLUSTER:
            return self._calculate_cluster_consensus(responses, raw_responses)
        else:
            return ConsensusResult(
                status=ConsensusStatus.FAILED,
                strategy=actual_strategy,
                threshold=self.threshold,
                score=0.0,
                consensus_text=None,
                all_responses=responses,
                all_raw_responses=raw_responses or [],
                error=f"Unknown strategy: {actual_strategy}"
            )

    def _calculate_semantic_consensus(
        self, responses: List[str], raw_responses: Optional[List[Dict[str, Any]]]
    ) -> ConsensusResult:
        """
        Calculate consensus using semantic similarity (embedding cosine similarity).
        
        The consensus score is the average pairwise similarity. If this exceeds
        the threshold, the most "central" response (highest avg similarity to others)
        is returned as the consensus text.
        """
        # Get embeddings for all responses
        embeddings = self.embedding_model.encode(responses)
        
        # Calculate pairwise cosine similarity
        # Normalize embeddings
        norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
        norms[norms == 0] = 1  # Avoid division by zero
        embeddings_norm = embeddings / norms
        similarity_matrix = np.dot(embeddings_norm, embeddings_norm.T)
        
        # Ensure diagonal is 0 (self-similarity doesn't count)
        np.fill_diagonal(similarity_matrix, 0)
        
        # Calculate average similarity for each response
        avg_similarities = np.mean(similarity_matrix, axis=1)
        
        # Overall consensus score is the average of all pairwise similarities
        all_pairwise = similarity_matrix[np.triu_indices(len(responses), k=1)]
        consensus_score = float(np.mean(all_pairwise)) if len(all_pairwise) > 0 else 0.0
        
        # Build pair similarity results
        pair_results = []
        for i in range(len(responses)):
            for j in range(i+1, len(responses)):
                pair_results.append(SimilarityResult(
                    response_a=responses[i],
                    response_b=responses[j],
                    similarity=float(similarity_matrix[i][j]),
                    strategy=ConsensusStrategy.SEMANTIC
                ))
        
        if consensus_score >= self.threshold:
            # Find the most central response (highest average similarity)
            central_idx = int(np.argmax(avg_similarities))
            return ConsensusResult(
                status=ConsensusStatus.ACHIEVED,
                strategy=ConsensusStrategy.SEMANTIC,
                threshold=self.threshold,
                score=consensus_score,
                consensus_text=responses[central_idx],
                all_responses=responses,
                all_raw_responses=raw_responses or [],
                similarity_matrix=similarity_matrix.tolist(),
                pair_similarities=pair_results,
                metadata={
                    "method": "embedding_cosine_similarity",
                    "embedding_model": self.embedding_model.model_name,
                    "central_response_index": central_idx,
                    "avg_similarities": avg_similarities.tolist()
                }
            )
        else:
            return ConsensusResult(
                status=ConsensusStatus.FAILED,
                strategy=ConsensusStrategy.SEMANTIC,
                threshold=self.threshold,
                score=consensus_score,
                consensus_text=None,
                all_responses=responses,
                all_raw_responses=raw_responses or [],
                similarity_matrix=similarity_matrix.tolist(),
                pair_similarities=pair_results,
                error=f"Consensus not achieved (threshold: {self.threshold}, score: {consensus_score:.4f})",
                metadata={
                    "method": "embedding_cosine_similarity",
                    "embedding_model": self.embedding_model.model_name
                }
            )

    def _calculate_exact_consensus(
        self, responses: List[str], raw_responses: Optional[List[Dict[str, Any]]]
    ) -> ConsensusResult:
        """
        Calculate consensus using exact string matching.
        
        Best for structured outputs (JSON, XML) where responses should be identical.
        """
        # Normalize responses (strip whitespace)
        normalized = [r.strip() for r in responses]
        
        # Find the most common response
        from collections import Counter
        counter = Counter(normalized)
        most_common, count = counter.most_common(1)[0]
        
        consensus_ratio = count / len(responses)
        
        if consensus_ratio >= self.threshold:
            return ConsensusResult(
                status=ConsensusStatus.ACHIEVED,
                strategy=ConsensusStrategy.EXACT,
                threshold=self.threshold,
                score=consensus_ratio,
                consensus_text=most_common,
                all_responses=responses,
                all_raw_responses=raw_responses or [],
                metadata={
                    "method": "exact_match",
                    "most_common_response": most_common,
                    "frequency": count
                }
            )
        else:
            return ConsensusResult(
                status=ConsensusStatus.FAILED,
                strategy=ConsensusStrategy.EXACT,
                threshold=self.threshold,
                score=consensus_ratio,
                consensus_text=None,
                all_responses=responses,
                all_raw_responses=raw_responses or [],
                error=f"Exact consensus not achieved (threshold: {self.threshold}, ratio: {consensus_ratio:.4f})",
                metadata={"method": "exact_match"}
            )

    def _calculate_keyword_consensus(
        self, responses: List[str], raw_responses: Optional[List[Dict[str, Any]]]
    ) -> ConsensusResult:
        """
        Calculate consensus using Jaccard similarity on token sets.
        """
        # Tokenize responses (simple whitespace + punctuation split)
        def tokenize(text: str) -> set:
            tokens = re.findall(r'\b\w+\b', text.lower())
            return set(tokens)
        
        token_sets = [tokenize(r) for r in responses]
        
        # Calculate pairwise Jaccard similarity
        n = len(responses)
        similarity_matrix = np.zeros((n, n))
        pair_similarities = []
        
        for i in range(n):
            for j in range(i, n):
                if i == j:
                    similarity_matrix[i][j] = 1.0
                else:
                    intersection = len(token_sets[i] & token_sets[j])
                    union = len(token_sets[i] | token_sets[j])
                    sim = intersection / union if union > 0 else 0.0
                    similarity_matrix[i][j] = sim
                    similarity_matrix[j][i] = sim
                    pair_similarities.append(SimilarityResult(
                        response_a=responses[i],
                        response_b=responses[j],
                        similarity=sim,
                        strategy=ConsensusStrategy.KEYWORD
                    ))
        
        # Calculate average pairwise similarity
        all_pairwise = similarity_matrix[np.triu_indices(n, k=1)]
        consensus_score = float(np.mean(all_pairwise)) if len(all_pairwise) > 0 else 0.0
        
        if consensus_score >= self.threshold:
            # Find most central response
            avg_similarities = np.mean(similarity_matrix, axis=1)
            central_idx = int(np.argmax(avg_similarities))
            return ConsensusResult(
                status=ConsensusStatus.ACHIEVED,
                strategy=ConsensusStrategy.KEYWORD,
                threshold=self.threshold,
                score=consensus_score,
                consensus_text=responses[central_idx],
                all_responses=responses,
                all_raw_responses=raw_responses or [],
                similarity_matrix=similarity_matrix.tolist(),
                pair_similarities=pair_similarities,
                metadata={
                    "method": "jaccard_similarity",
                    "token_counts": [len(s) for s in token_sets],
                    "central_response_index": central_idx
                }
            )
        else:
            return ConsensusResult(
                status=ConsensusStatus.FAILED,
                strategy=ConsensusStrategy.KEYWORD,
                threshold=self.threshold,
                score=consensus_score,
                consensus_text=None,
                all_responses=responses,
                all_raw_responses=raw_responses or [],
                similarity_matrix=similarity_matrix.tolist(),
                pair_similarities=pair_similarities,
                error=f"Keyword consensus not achieved (threshold: {self.threshold}, score: {consensus_score:.4f})",
                metadata={"method": "jaccard_similarity"}
            )

    def _calculate_majority_consensus(
        self, responses: List[str], raw_responses: Optional[List[Dict[str, Any]]]
    ) -> ConsensusResult:
        """
        Calculate consensus using majority vote.
        
        Best for multiple-choice questions where responses should be identical.
        """
        from collections import Counter
        
        counter = Counter(responses)
        most_common, count = counter.most_common(1)[0]
        
        consensus_ratio = count / len(responses)
        
        if consensus_ratio >= self.threshold:
            return ConsensusResult(
                status=ConsensusStatus.ACHIEVED,
                strategy=ConsensusStrategy.MAJORITY,
                threshold=self.threshold,
                score=consensus_ratio,
                consensus_text=most_common,
                all_responses=responses,
                all_raw_responses=raw_responses or [],
                metadata={
                    "method": "majority_vote",
                    "most_common_response": most_common,
                    "frequency": count,
                    "vote_counts": dict(counter)
                }
            )
        else:
            return ConsensusResult(
                status=ConsensusStatus.FAILED,
                strategy=ConsensusStrategy.MAJORITY,
                threshold=self.threshold,
                score=consensus_ratio,
                consensus_text=None,
                all_responses=responses,
                all_raw_responses=raw_responses or [],
                error=f"Majority not achieved (threshold: {self.threshold}, ratio: {consensus_ratio:.4f})",
                metadata={
                    "method": "majority_vote",
                    "vote_counts": dict(counter)
                }
            )

    def _calculate_cluster_consensus(
        self, responses: List[str], raw_responses: Optional[List[Dict[str, Any]]]
    ) -> ConsensusResult:
        """
        Calculate consensus by finding the largest cluster of similar responses.
        
        Uses semantic similarity and DBSCAN-like clustering.
        """
        if len(responses) < 2:
            return self._calculate_semantic_consensus(responses, raw_responses)
        
        # Get embeddings and similarity matrix
        embeddings = self.embedding_model.encode(responses)
        norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
        norms[norms == 0] = 1
        embeddings_norm = embeddings / norms
        similarity_matrix = np.dot(embeddings_norm, embeddings_norm.T)
        np.fill_diagonal(similarity_matrix, 0)
        
        # Simple clustering: responses are in same cluster if similarity >= threshold
        n = len(responses)
        visited = [False] * n
        clusters = []
        
        for i in range(n):
            if visited[i]:
                continue
            cluster = [i]
            visited[i] = True
            # Add all responses similar to i
            for j in range(i+1, n):
                if not visited[j] and similarity_matrix[i][j] >= self.threshold:
                    cluster.append(j)
                    visited[j] = True
            clusters.append(cluster)
        
        # Find the largest cluster
        largest_cluster = max(clusters, key=len)
        
        cluster_ratio = len(largest_cluster) / len(responses)
        
        if cluster_ratio >= self.threshold:
            # Use the most central response in the largest cluster
            cluster_indices = largest_cluster
            cluster_similarities = similarity_matrix[np.ix_(cluster_indices, cluster_indices)]
            avg_similarities = np.mean(cluster_similarities, axis=1)
            central_idx_in_cluster = int(np.argmax(avg_similarities))
            central_idx = cluster_indices[central_idx_in_cluster]
            
            return ConsensusResult(
                status=ConsensusStatus.ACHIEVED,
                strategy=ConsensusStrategy.CLUSTER,
                threshold=self.threshold,
                score=float(cluster_ratio),
                consensus_text=responses[central_idx],
                all_responses=responses,
                all_raw_responses=raw_responses or [],
                similarity_matrix=similarity_matrix.tolist(),
                clusters=[[responses[i] for i in cluster] for cluster in clusters],
                metadata={
                    "method": "cluster_similarity",
                    "largest_cluster_size": len(largest_cluster),
                    "largest_cluster_indices": largest_cluster,
                    "central_response_index": central_idx
                }
            )
        else:
            return ConsensusResult(
                status=ConsensusStatus.FAILED,
                strategy=ConsensusStrategy.CLUSTER,
                threshold=self.threshold,
                score=float(cluster_ratio),
                consensus_text=None,
                all_responses=responses,
                all_raw_responses=raw_responses or [],
                similarity_matrix=similarity_matrix.tolist(),
                clusters=[[responses[i] for i in cluster] for cluster in clusters],
                error=f"No cluster meets size threshold (largest: {len(largest_cluster)}/{len(responses)})",
                metadata={
                    "method": "cluster_similarity",
                    "cluster_sizes": [len(c) for c in clusters]
                }
            )


# =============================================================================
# TaskBot Implementation
# =============================================================================

class TaskBot:
    """
    Enhanced TaskBot with full consensus calculation capabilities.
    
    Handles:
    - Repetitive tasks (format_output, fetch_data)
    - Multi-LLM broadcast operations
    - Consensus calculation with multiple strategies
    - Security guard enforcement
    """
    
    # Default consensus strategy mapping by task type
    DEFAULT_STRATEGIES = {
        "legal_analysis": ConsensusStrategy.SEMANTIC,
        "code_generation": ConsensusStrategy.EXACT,
        "multiple_choice": ConsensusStrategy.MAJORITY,
        "summarization": ConsensusStrategy.SEMANTIC,
        "classification": ConsensusStrategy.KEYWORD,
    }
    
    # Default thresholds by strategy
    DEFAULT_THRESHOLDS = {
        ConsensusStrategy.SEMANTIC: 0.7,
        ConsensusStrategy.EXACT: 1.0,
        ConsensusStrategy.KEYWORD: 0.6,
        ConsensusStrategy.MAJORITY: 0.5,
        ConsensusStrategy.CLUSTER: 0.6,
    }

    def __init__(
        self,
        llm_router: Optional[LLMRouter] = None,
        permission_guard: Optional[PermissionGuard] = None,
        template_engine: Optional[TemplateEngine] = None,
        consensus_engine: Optional[ConsensusEngine] = None,
        embedding_model: Optional[EmbeddingModel] = None,
        use_production_embeddings: Optional[bool] = None
    ):
        """
        Initialize the TaskBot.
        
        Args:
            llm_router: LLM router for external LLM access
            permission_guard: Permission guard for security checks
            template_engine: Template engine for variable substitution
            consensus_engine: Consensus engine for multi-LLM consensus
            embedding_model: Custom embedding model (optional)
            use_production_embeddings: Override USE_MOCK_EMBEDDINGS setting
        """
        self.llm_router = llm_router
        self.permission_guard = permission_guard or PermissionGuard()
        # Use secure template engine (blocks env vars by default)
        self.template_engine = template_engine or TemplateEngineFactory.create_untrusted()
        self._trusted_template_engine = TemplateEngineFactory.create_trusted()
        
        # Configure embedding model
        if use_production_embeddings is not None:
            # Override based on parameter
            embedding_model = EmbeddingModel(auto_init=True)
            embedding_model._use_mock = not use_production_embeddings
        elif embedding_model is None:
            # Use default with environment variable
            embedding_model = EmbeddingModel(auto_init=True)
        
        self.consensus_engine = consensus_engine or ConsensusEngine(embedding_model=embedding_model)

    def execute(self, task: Dict[str, Any], input_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Execute a task.
        
        Args:
            task: Task specification
            input_data: Optional input data
            
        Returns:
            Task result
        """
        action = task.get("action", "format_output").lower()
        params = task.get("parameters", {})

        if action == "format_output":
            fmt = params.get("format", "json")
            return {
                "status": "success",
                "action": "format_output",
                "format": fmt,
                "formatted_data": input_data or {}
            }
        elif action == "fetch_data":
            return {
                "status": "success",
                "action": "fetch_data",
                "source": params.get("source", "court_records"),
                "records": []
            }
        elif action == "transform":
            # Transform input data using template
            template = params.get("template", "{{data}}")
            if input_data:
                rendered = self.template_engine.render(template, input_data)
            else:
                rendered = self.template_engine.render(template)
            return {
                "status": "success",
                "action": "transform",
                "result": rendered
            }
        else:
            return {
                "status": "success",
                "action": action,
                "data": input_data or {}
            }

    def broadcast_to_llms(
        self,
        task: Dict[str, Any],
        sensitivity: SensitivityLevel = SensitivityLevel.PUBLIC,
        providers: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Executes a task across external LLMs, ensuring sensitive case data is never broadcast.
        
        Args:
            task: Task to execute
            sensitivity: Sensitivity level (PUBLIC, INTERNAL, CASE_DATA, PRIVILEGED)
            providers: Optional list of provider names to use
            
        Returns:
            Dictionary with first response and all results
        """
        # Security Guard check - block sensitive data
        self.permission_guard.validate_broadcast(sensitivity)

        if not self.llm_router:
            raise RuntimeError("LLMRouter not configured on TaskBot")

        # Call the LLM router's broadcast method
        return self.llm_router.broadcast(task, sensitivity=sensitivity, providers=providers)

    def execute_on_all_llms(
        self,
        task: Dict[str, Any],
        sensitivity: SensitivityLevel = SensitivityLevel.PUBLIC,
        providers: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Alias for broadcast_to_llms.
        """
        return self.broadcast_to_llms(task, sensitivity=sensitivity, providers=providers)

    def get_llm_consensus(
        self,
        task: Dict[str, Any],
        sensitivity: SensitivityLevel = SensitivityLevel.PUBLIC,
        threshold: Optional[float] = None,
        strategy: Optional[ConsensusStrategy] = None,
        providers: Optional[List[str]] = None,
        min_responses: int = 3
    ) -> Dict[str, Any]:
        """
        Execute task across multiple LLMs and calculate consensus.
        
        This is the PRIMARY CONSENSUS METHOD - fully implemented with:
        - Semantic similarity using embeddings
        - Multiple consensus strategies
        - Configurable thresholds
        - Detailed similarity reporting
        
        Args:
            task: Task to execute
            sensitivity: Sensitivity level (PUBLIC, INTERNAL, CASE_DATA, PRIVILEGED)
            threshold: Consensus threshold (0.0 to 1.0). Defaults based on strategy.
            strategy: Consensus strategy. Auto-detected from task type if not specified.
            providers: Optional list of provider names to use
            min_responses: Minimum number of responses required for consensus
            
        Returns:
            Dictionary with consensus result, including:
            - status: "success", "failed", or "partial"
            - consensus_status: "achieved", "failed", or "partial"
            - consensus_score: Similarity score (0.0 to 1.0)
            - consensus_text: The agreed-upon response
            - strategy: Strategy used
            - threshold: Threshold used
            - all_responses: All individual responses
            - similarity_matrix: Pairwise similarity scores
            - metadata: Additional info (clusters, etc.)
            
        Raises:
            PermissionDeniedError: If sensitivity level is too high
            RuntimeError: If LLMRouter not configured or too few responses
            
        Example:
            result = task_bot.get_llm_consensus(
                task={"prompt": "Analyze this legal precedent"},
                strategy=ConsensusStrategy.SEMANTIC,
                threshold=0.75
            )
            if result["consensus_status"] == "achieved":
                print(f"Consensus: {result['consensus_text']}")
        """
        # Security check - block sensitive data from being broadcast
        self.permission_guard.validate_broadcast(sensitivity)

        if not self.llm_router:
            raise RuntimeError("LLMRouter not configured on TaskBot")
        
        # Determine strategy and threshold
        actual_strategy = strategy or self._detect_strategy(task)
        actual_threshold = threshold or self.DEFAULT_THRESHOLDS.get(actual_strategy, 0.7)
        
        # Broadcast to multiple providers
        broadcast_result = self.llm_router.broadcast(
            task, 
            sensitivity=sensitivity, 
            providers=providers
        )
        
        # Extract responses
        all_results = broadcast_result.get("all_results", {})
        
        if len(all_results) < min_responses:
            return {
                "status": "failed",
                "error": f"Insufficient responses: {len(all_results)} < {min_responses}",
                "num_responses": len(all_results),
                "min_responses": min_responses
            }
        
        # Extract response texts
        responses = []
        raw_responses = []
        for provider_name, result in all_results.items():
            content = result.get("content", "")
            if content:
                responses.append(content)
                raw_responses.append(result)
        
        if len(responses) < min_responses:
            return {
                "status": "failed",
                "error": f"Insufficient valid responses: {len(responses)} < {min_responses}",
                "num_responses": len(responses),
                "min_responses": min_responses
            }
        
        # Create consensus engine with specified strategy and threshold
        engine = ConsensusEngine(
            strategy=actual_strategy,
            threshold=actual_threshold,
            embedding_model=self.consensus_engine.embedding_model
        )
        
        # Calculate consensus
        consensus_result = engine.calculate(responses, raw_responses)
        
        # Build result dictionary
        result = {
            "status": "success" if consensus_result.status == ConsensusStatus.ACHIEVED else "failed",
            "consensus_status": consensus_result.status.value,
            "consensus_score": consensus_result.score,
            "consensus_text": consensus_result.consensus_text,
            "strategy": consensus_result.strategy.value,
            "threshold": consensus_result.threshold,
            "num_responses": len(responses),
            "all_responses": consensus_result.all_responses,
            "all_raw_responses": consensus_result.all_raw_responses,
            "first_response_provider": broadcast_result.get("first_provider"),
            "first_response": broadcast_result.get("result"),
        }
        
        # Add optional fields if present
        if consensus_result.similarity_matrix:
            result["similarity_matrix"] = consensus_result.similarity_matrix
        if consensus_result.pair_similarities:
            result["pair_similarities"] = [
                {
                    "response_a": s.response_a,
                    "response_b": s.response_b,
                    "similarity": s.similarity
                } for s in consensus_result.pair_similarities
            ]
        if consensus_result.clusters:
            result["clusters"] = consensus_result.clusters
        if consensus_result.error:
            result["consensus_error"] = consensus_result.error
        if consensus_result.metadata:
            result["metadata"] = consensus_result.metadata
        
        # Add error if consensus not achieved
        if consensus_result.status != ConsensusStatus.ACHIEVED:
            result["error"] = consensus_result.error or "Consensus not achieved"
        
        return result

    def get_llm_consensus_structured(
        self,
        task: Dict[str, Any],
        sensitivity: SensitivityLevel = SensitivityLevel.PUBLIC,
        output_schema: Optional[Dict[str, Any]] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Execute task across multiple LLMs with structured output consensus.
        
        For tasks that should return structured data (JSON), this method:
        1. Requests structured output from all providers
        2. Validates responses against schema
        3. Calculates consensus using exact matching for structured data
        
        Args:
            task: Task to execute
            sensitivity: Sensitivity level
            output_schema: Optional JSON schema for validation
            **kwargs: Additional arguments passed to get_llm_consensus
            
        Returns:
            Dictionary with consensus result for structured outputs
        """
        # For structured outputs, we want exact matching
        kwargs.setdefault("strategy", ConsensusStrategy.EXACT)
        kwargs.setdefault("threshold", 1.0)
        
        # Add structured output request to task
        task_copy = task.copy()
        task_copy["structured"] = True
        if output_schema:
            task_copy["output_schema"] = output_schema
        
        return self.get_llm_consensus(task_copy, sensitivity=sensitivity, **kwargs)

    def _detect_strategy(self, task: Dict[str, Any]) -> ConsensusStrategy:
        """
        Auto-detect the best consensus strategy for a task.
        
        Args:
            task: Task specification
            
        Returns:
            Recommended ConsensusStrategy
        """
        action = task.get("action", "").lower()
        task_type = task.get("type", "").lower()
        
        # Check for explicit strategy in task
        if "consensus_strategy" in task:
            strategy_name = task["consensus_strategy"].lower()
            for s in ConsensusStrategy:
                if s.value == strategy_name:
                    return s
        
        # Match against known task types
        for pattern, strategy in self.DEFAULT_STRATEGIES.items():
            if pattern in action or pattern in task_type:
                return strategy
        
        # Default to semantic for general text tasks
        return ConsensusStrategy.SEMANTIC

    def get_consensus_strategies(self) -> Dict[str, str]:
        """
        Get information about available consensus strategies.
        
        Returns:
            Dictionary with strategy names and descriptions
        """
        return {
            "semantic": "Embedding-based cosine similarity (best for free-text responses)",
            "exact": "Exact string matching (best for structured outputs like JSON)",
            "keyword": "Jaccard similarity on token sets (good for keyword-based matching)",
            "majority": "Simple majority vote (best for multiple-choice questions)",
            "cluster": "Largest cluster of similar responses (good for diverse responses)"
        }

    def get_consensus_thresholds(self) -> Dict[str, float]:
        """
        Get default thresholds for each strategy.
        
        Returns:
            Dictionary with strategy names and default thresholds
        """
        return {s.value: v for s, v in self.DEFAULT_THRESHOLDS.items()}


# =============================================================================
# Convenience Functions
# =============================================================================

def create_task_bot(
    llm_router: Optional[LLMRouter] = None,
    permission_guard: Optional[PermissionGuard] = None,
    template_engine: Optional[TemplateEngine] = None,
    embedding_model_name: str = "all-MiniLM-L6-v2",
    use_production_embeddings: Optional[bool] = None
) -> TaskBot:
    """
    Factory function to create a TaskBot with proper defaults.
    
    Args:
        llm_router: Optional LLM router
        permission_guard: Optional permission guard
        template_engine: Optional template engine
        embedding_model_name: Name of the embedding model to use
        use_production_embeddings: Set to True for real embeddings, False for mock
        
    Returns:
        Configured TaskBot instance
        
    Environment Variables:
        USE_MOCK_EMBEDDINGS: Set to "false" to use real embeddings (default: "true")
    """
    # Determine if we should use production embeddings
    if use_production_embeddings is None:
        use_prod_env = os.getenv('USE_MOCK_EMBEDDINGS', 'true').lower() != 'true'
    else:
        use_prod_env = use_production_embeddings
    
    embedding_model = EmbeddingModel(
        model_name=embedding_model_name,
        auto_init=use_prod_env
    )
    
    # Override mock setting based on parameter/environment
    if use_production_embeddings is not None:
        embedding_model._use_mock = not use_production_embeddings
    
    consensus_engine = ConsensusEngine(embedding_model=embedding_model)
    
    return TaskBot(
        llm_router=llm_router,
        permission_guard=permission_guard,
        template_engine=template_engine,
        consensus_engine=consensus_engine,
        use_production_embeddings=use_production_embeddings
    )
