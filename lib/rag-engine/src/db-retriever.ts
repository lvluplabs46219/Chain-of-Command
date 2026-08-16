import { CourtListenerClient, AuthoritySource } from '../../connectors/src/courtlistener-client';

export interface JurisdictionFilter {
  state: string;
  county?: string;
  courtType?: string;
}

export class CitationVerifier {
  verify(citation: string, sourceText: string): boolean {
    if (!citation || !sourceText) return false;
    return sourceText.toLowerCase().includes(citation.toLowerCase());
  }
}

export class DBRetriever {
  private courtListener: CourtListenerClient;
  private verifier: CitationVerifier;

  constructor() {
    this.courtListener = new CourtListenerClient();
    this.verifier = new CitationVerifier();
  }

  async retrieveAuthorities(query: string, filter: JurisdictionFilter): Promise<AuthoritySource[]> {
    console.log(`Searching local DB for query: "${query}" in state: ${filter.state}`);
    
    // 1. Try Local Postgres/pgvector DB First
    let localResults: AuthoritySource[] = [];
    
    /* 
      // Example pgvector lookup implementation:
      const queryEmbedding = await generateEmbedding(query);
      const results = await db.query.authoritiesTable.findMany({
        where: and(
          eq(authoritiesTable.state, filter.state)
        ),
        orderBy: (authorities, { sql }) => sql`${authorities.embedding} <-> ${queryEmbedding}`,
        limit: 5
      });
      localResults = mapToAuthoritySource(results);
    */

    // 2. Fallback to CourtListener API if local index coverage is low
    if (localResults.length < 3) {
      console.log('Local coverage low, falling back to CourtListener API...');
      const externalResults = await this.courtListener.searchOpinions(query, filter.state);
      
      // Merge results
      const merged = [...localResults, ...externalResults];
      
      return merged;
    }

    return localResults;
  }
}
