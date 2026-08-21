import { logger } from "./logger";

export interface ScrapingJobResponse {
  id: number;
  custom_id: string;
  sitemap_id: number;
  status: "scheduling" | "running" | "succeeded" | "failed";
  scraping_duration: number;
}

export class WebScraperClient {
  private readonly apiKey: string;
  private readonly baseUrl = "https://cloud.webscraper.io/api/v1";

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.WEBSCRAPER_API_KEY || "";
    if (!this.apiKey) {
      logger.warn("WEBSCRAPER_API_KEY is not set. WebScraper API operations will fail.");
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}${endpoint.includes("?") ? "&" : "?"}api_token=${this.apiKey}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`WebScraper API error (${response.status}): ${errorBody}`);
    }

    const payload = (await response.json()) as { data: T };
    return payload.data;
  }

  /**
   * Launch a scraping job for a predefined sitemap with dynamic start URLs.
   */
  async triggerScrapingJob(
    sitemapId: number,
    dynamicStartUrls: string[],
    customId?: string,
  ): Promise<ScrapingJobResponse> {
    logger.info(`Triggering WebScraper job for sitemap ${sitemapId}`);

    return this.request<ScrapingJobResponse>("/scraping-job", {
      method: "POST",
      body: JSON.stringify({
        sitemap_id: sitemapId,
        driver: "fulljs", // Handles dynamic JS/SPAs
        custom_id: customId || `case_${Date.now()}`,
        start_urls: dynamicStartUrls,
      }),
    });
  }

  /**
   * Check execution status of a scraping job.
   */
  async getJobStatus(jobId: number): Promise<ScrapingJobResponse> {
    return this.request<ScrapingJobResponse>(`/scraping-job/${jobId}`);
  }

  /**
   * Fetch extracted structured JSON records from a completed job.
   */
  async getJobData<T = any>(jobId: number): Promise<T[]> {
    return this.request<T[]>(`/scraping-job/${jobId}/data?format=json`);
  }
}

export const webScraperClient = new WebScraperClient();
