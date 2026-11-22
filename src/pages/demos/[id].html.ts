import type { APIRoute, GetStaticPaths } from 'astro';
import { getProjects } from '../../data/projects';

export const getStaticPaths: GetStaticPaths = async () => {
  const projects = await getProjects('es');
  return projects
    .filter((project): project is typeof project & { demoHtml: string } => Boolean(project.demoHtml))
    .map((project) => ({
      params: { id: project.id },
      props: { html: project.demoHtml },
    }));
};

export const GET: APIRoute = ({ props }) =>
  new Response(String(props.html ?? ''), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
