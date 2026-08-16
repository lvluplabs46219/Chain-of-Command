import axios from 'axios';

export interface AuthoritySource {
  id: string;
  title: string;
  citation: string;
  court: string;
  dateFiled: string;
  isOfficial: boolean;
  trustBadge: 'gold' | 'gray' | 'red';
  url: string;
}

export class CourtListenerClient {
  private apiToken: string;
  private baseUrl = 'https://www.courtlistener.com/api/rest/v4';

  constructor(apiToken?: string) {
    this.apiToken = apiToken || process.env.COURTLISTENER_API_TOKEN || '';
    if (!this.apiToken) {
      console.warn('CourtListener API token is missing. Calls may be rate-limited or fail.');
    }
  }

  private getHeaders() {
    return this.apiToken ? { Authorization: `Token ${this.apiToken}` } : {};
  }

  private computeTrustBadge(dateFiled: string, isOfficial: boolean): 'gold' | 'gray' | 'red' {
    const filedDate = new Date(dateFiled);
    const now = new Date();
    const daysOld = Math.floor((now.getTime() - filedDate.getTime()) / (1000 * 60 * 60 * 24));

    if (isOfficial && daysOld <= 30) {
      return 'gold';
    } else if (daysOld > 90) {
      return 'red';
    }
    return 'gray';
  }

  async searchOpinions(query: string, state: string): Promise<AuthoritySource[]> {
    try {
      const jurisdictionMap: Record<string, string> = {
        'CA': 'cal',
        'NY': 'ny',
        'IN': 'ind',
      };
      
      const courtId = jurisdictionMap[state.toUpperCase()] || 'scotus';

      const response = await axios.get(`${this.baseUrl}/search/`, {
        headers: this.getHeaders(),
        params: {
          q: query,
          court: courtId,
          type: 'o',
        }
      });

      const results = response.data.results || [];

      return results.map((item: any) => ({
        id: item.id?.toString() || item.cluster_id?.toString() || Math.random().toString(),
        title: item.caseName || item.case_name || 'Unknown Case',
        citation: item.citation || 'Unknown Citation',
        court: item.court || 'Unknown Court',
        dateFiled: item.dateFiled || item.date_filed || new Date().toISOString(),
        isOfficial: item.is_precedential || false,
        trustBadge: this.computeTrustBadge(item.dateFiled || item.date_filed, item.is_precedential),
        url: `https://www.courtlistener.com${item.absolute_url || ''}`,
      }));
    } catch (error) {
      console.error('CourtListener API error:', error);
      // Fallback/circuit breaker logging to health_checks table could go here
      return [];
    }
  }
}
