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

export const STATE_COURT_MAPPINGS: Record<string, string> = {
  AL: 'ala', AK: 'alaska', AZ: 'ariz', AR: 'ark', CA: 'cal',
  CO: 'colo', CT: 'conn', DE: 'del', FL: 'fla', GA: 'ga',
  HI: 'haw', ID: 'idaho', IL: 'ill', IN: 'ind', IA: 'iowa',
  KS: 'kan', KY: 'ky', LA: 'la', ME: 'me', MD: 'md',
  MA: 'mass', MI: 'mich', MN: 'minn', MS: 'miss', MO: 'mo',
  MT: 'mont', NE: 'neb', NV: 'nev', NH: 'nh', NJ: 'nj',
  NM: 'nm', NY: 'ny', NC: 'nc', ND: 'nd', OH: 'ohio',
  OK: 'okla', OR: 'or', PA: 'pa', RI: 'ri', SC: 'sc',
  SD: 'sd', TN: 'tenn', TX: 'tex', UT: 'utah', VT: 'vt',
  VA: 'va', WA: 'wash', WV: 'wva', WI: 'wis', WY: 'wyo',
  DC: 'dc', US: 'scotus', FED: 'ca1,ca2,ca3,ca4,ca5,ca6,ca7,ca8,ca9,ca10,ca11,cadc,cafc'
};

export class CourtListenerClient {
  private apiToken: string;
  private baseUrl = 'https://www.courtlistener.com/api/rest/v4';

  constructor(apiToken?: string) {
    this.apiToken = apiToken || process.env.COURTLISTENER_API_TOKEN || '';
    if (!this.apiToken && process.env.NODE_ENV === 'production') {
      console.warn('CourtListener API token is missing. Calls may be rate-limited.');
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiToken) {
      headers['Authorization'] = `Token ${this.apiToken}`;
    }
    return headers;
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
      const courtId = STATE_COURT_MAPPINGS[state.toUpperCase()] || 'scotus';
      const url = new URL(`${this.baseUrl}/search/`);
      url.searchParams.set('q', query);
      url.searchParams.set('court', courtId);
      url.searchParams.set('type', 'o');

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`CourtListener HTTP Error: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as { results?: any[] };
      const results = data.results || [];

      return results.map((item: any) => ({
        id: String(item.id || item.cluster_id || `cl-${Date.now()}`),
        title: item.caseName || item.case_name || 'Unknown Case',
        citation: item.citation || item.citation_string || 'Unpublished Citation',
        court: item.court || 'Jurisdiction Authority',
        dateFiled: item.dateFiled || item.date_filed || new Date().toISOString(),
        isOfficial: Boolean(item.is_precedential || item.precedential_status === 'Published'),
        trustBadge: this.computeTrustBadge(item.dateFiled || item.date_filed, Boolean(item.is_precedential)),
        url: `https://www.courtlistener.com${item.absolute_url || ''}`,
      }));
    } catch (error) {
      console.error('CourtListener fetch error:', error);
      return [];
    }
  }
}
