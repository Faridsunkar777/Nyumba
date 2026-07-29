import { upcomingProjects } from '../mock/projects';
import { UpcomingProject } from '../types';

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getUpcomingProjects(county?: string): Promise<UpcomingProject[]> {
  await delay();
  if (!county) return upcomingProjects;
  return upcomingProjects.filter((p) => p.county === county);
}

export async function getUpcomingProjectById(id: string): Promise<UpcomingProject | null> {
  await delay(100);
  return upcomingProjects.find((p) => p.id === id) ?? null;
}
