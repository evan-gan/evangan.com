import { marked } from 'marked';
import yaml from 'js-yaml';
import fs from 'fs';
import path from 'path';
import { formatDate } from './date';

marked.setOptions({
  breaks: true,
  gfm: true
});

const PROJECTS_FILE = path.join(process.cwd(), 'projects', 'projects.yaml');
const FALLBACK_THUMBNAIL = '/thumbnails/placeholder.svg';

export type ProjectLinkType = 'website' | 'github' | 'demo' | 'external';

export interface ProjectLink {
  type: ProjectLinkType;
  label: string;
  url: string;
}

export interface ProjectData {
  id: string;
  date: string;
  dateDisplay: string;
  name: string;
  nameHtml: string;
  tagline: string;
  taglineHtml: string;
  description: string;
  descriptionHtml: string;
  thumbnail: string;
  categories: string[];
  categorySlugs: string[];
  importance: number;
  links: ProjectLink[];
}

export interface ProjectCategory {
  name: string; // slug
  displayName: string;
  projects: ProjectData[];
}

function parseInlineMarkdown(text: string): string {
  const html = marked.parseInline(text);
  return typeof html === 'string' ? html : '';
}

function parseMarkdown(text: string): string {
  const html = marked.parse(text);
  return typeof html === 'string' ? html : '';
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '') || 'uncategorized';
}

function normalizeURL(url: string | undefined): string | undefined {
  if (!url || url.trim() === '') return undefined;
  
  const trimmedUrl = url.trim();
  
  // If it starts with a slash, it's a local path - leave it as is
  if (trimmedUrl.startsWith('/')) return trimmedUrl;
  
  // If it already has a protocol (http://, https://, etc.), leave it as is
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmedUrl)) return trimmedUrl;
  
  // If it contains a dot (domain.ext), add https://
  if (trimmedUrl.includes('.')) return `https://${trimmedUrl}`;
  
  // Otherwise, leave it as is
  return trimmedUrl;
}

interface NormalizedProjectsResult {
  projects: ProjectData[];
  categories: ProjectCategory[];
}

function normalizeProjects(): NormalizedProjectsResult {
  if (!fs.existsSync(PROJECTS_FILE)) {
    console.warn(`Projects file not found at ${PROJECTS_FILE}`);
    return { projects: [], categories: [] };
  }

  let parsedYaml: unknown;
  try {
    const fileContent = fs.readFileSync(PROJECTS_FILE, 'utf-8');
    parsedYaml = yaml.load(fileContent);
  } catch (error) {
    console.error('Error reading projects.yaml:', error);
    return { projects: [], categories: [] };
  }

  if (!Array.isArray(parsedYaml)) {
    console.warn('projects.yaml must export an array of project entries');
    return { projects: [], categories: [] };
  }

  const projectEntries: Array<{ project: ProjectData; sortOrder: number }> = [];

  parsedYaml.forEach((item, index) => {
    if (!item || typeof item !== 'object') {
      console.warn(`Skipping invalid project entry at index ${index}`);
      return;
    }

    const data = item as Record<string, unknown>;

    const name = typeof data.name === 'string' ? data.name.trim() : '';
    if (!name) {
      console.warn(`Missing name for project entry at index ${index}`);
      return;
    }

    const description = typeof data.description === 'string' ? data.description : '';
    if (!description) {
      console.warn(`Missing description for project "${name}"`);
      return;
    }

    const taglineRaw = typeof data.tagline === 'string' ? data.tagline : '';
    const tagline = taglineRaw || description.split('\n')[0].trim() || name;

    const categoriesRaw = Array.isArray(data.categories) ? data.categories : [];
    const categories = categoriesRaw
      .map((cat) => (typeof cat === 'string' ? cat.trim() : ''))
      .filter(Boolean);

    if (categories.length === 0) {
      categories.push('Uncategorized');
    }

    const categorySlugs = categories.map(slugify);

    const importanceValue = typeof data.importance === 'number'
      ? data.importance
      : parseInt(String(data.importance ?? ''), 10);
    const importance = Number.isFinite(importanceValue) ? importanceValue : 9000 + index;

    const date = typeof data.date === 'string' ? data.date : '';
    const thumbnail = typeof data.thumbnail === 'string' && data.thumbnail.trim()
      ? data.thumbnail.trim()
      : FALLBACK_THUMBNAIL;

    const websiteURL = normalizeURL(
      typeof data.websiteURL === 'string' && data.websiteURL.trim()
        ? data.websiteURL.trim()
        : undefined
    );
    const githubURL = normalizeURL(
      typeof data.githubURL === 'string' && data.githubURL.trim()
        ? data.githubURL.trim()
        : undefined
    );
    const demoURL = normalizeURL(
      typeof data.demoURL === 'string' && data.demoURL.trim()
        ? data.demoURL.trim()
        : undefined
    );
    const legacyLink = normalizeURL(
      typeof data.link === 'string' && data.link.trim()
        ? data.link.trim()
        : undefined
    );

    const links: ProjectLink[] = [];
    if (websiteURL) {
      links.push({ type: 'website', label: 'Site', url: websiteURL });
    }
    if (githubURL) {
      links.push({ type: 'github', label: 'Code', url: githubURL });
    }
    if (demoURL) {
      links.push({ type: 'demo', label: 'Demo', url: demoURL });
    }
    if (legacyLink && !links.some((link) => link.url === legacyLink)) {
      links.push({ type: websiteURL ? 'external' : 'website', label: websiteURL ? 'More' : 'View', url: legacyLink });
    }

    const project: ProjectData = {
      id: slugify(name),
      date,
      dateDisplay: formatDate(date),
      name,
      nameHtml: parseInlineMarkdown(name),
      tagline,
      taglineHtml: parseInlineMarkdown(tagline),
      description,
      descriptionHtml: parseMarkdown(description),
      thumbnail,
      categories,
      categorySlugs,
      importance,
      links
    };

    projectEntries.push({ project, sortOrder: index });
  });

  projectEntries.sort((a, b) => {
    if (a.project.importance === b.project.importance) {
      return a.sortOrder - b.sortOrder;
    }
    return a.project.importance - b.project.importance;
  });

  const projects = projectEntries.map((entry) => entry.project);

  const categoryMap = new Map<string, { displayName: string; projects: ProjectData[]; minImportance: number }>();

  projects.forEach((project) => {
    project.categories.forEach((categoryName, idx) => {
      const slug = project.categorySlugs[idx] ?? slugify(categoryName);
      if (!categoryMap.has(slug)) {
        categoryMap.set(slug, {
          displayName: categoryName,
          projects: [],
          minImportance: project.importance
        });
      }

      const category = categoryMap.get(slug)!;
      category.projects.push(project);
      category.minImportance = Math.min(category.minImportance, project.importance);
    });
  });

  const categoryEntries = Array.from(categoryMap.entries())
    .map(([slug, value]) => ({
      name: slug,
      displayName: value.displayName,
      projects: value.projects,
      order: value.minImportance
    }))
    .sort((a, b) => a.order - b.order);

  const categories = categoryEntries.map(({ name, displayName, projects }) => ({
    name,
    displayName,
    projects
  }));

  return { projects, categories };
}

export function loadAllProjects(): ProjectCategory[] {
  return normalizeProjects().categories;
}

export function getAllProjectsFlat(): ProjectData[] {
  return normalizeProjects().projects;
}