export interface Story {
  authors: Array<string>;
  categoryName: string;
  id: string;
  name: string;
  url: string;
}

export interface Release {
  releaseName: string;
  stories: Array<Story>;
}

export interface WeekContent {
  weekText: string;
  releases: Array<Release>;
}
