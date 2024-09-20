import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import { LoggerService } from '@backstage/backend-plugin-api';
import { Config } from '@backstage/config';
import express from 'express';
import Router from 'express-promise-router';
import os from 'os';
import fetch from 'node-fetch';
import { Action, Actions, Branches, GeparcedemyEntry, GeparcedemyView, WorkflowRuns } from './types';

export interface RouterOptions {
  logger: LoggerService;
  config: Config;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config } = options;

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, res) => {
    logger.info('PONG!');
    res.json({ status: 'ok' });
  });

  router.get('/system-info', (_, res) => {
    const systemInfo = {
      data: {
        hostname: os.hostname(),
        operatingSystem: os.type(),
        platform: os.platform(),
        release: os.release(),
        uptime: os.uptime(),
        loadavg: os.loadavg(),
        totalMem: os.totalmem(),
        freeMem: os.freemem(),
      },
      cpus: os.cpus(),
    };

    res.send(systemInfo);
  });

  router.get('/pullrequests', (_, res) => {
    const pullrequests = [
      {
        build: true,
        title: 'Upgrade quarkus from 2.16.12.final to 3.14.3',
        url: 'https://github.com/Gepardec/renovate-playground/pull/249',
        devspace:
          'https://devspaces.apps.sandbox-m2.ll9k.p1.openshiftapps.com/#https://github.com/Gepardec/renovate-playground/tree/postupgradetask/quarkus_2.16.12.final_3.14.3',
      },
      {
        build: false,
        title: 'Update quarkus to v3',
        url: 'https://github.com/Gepardec/renovate-playground/pull/248',
        devspace:
          'https://devspaces.apps.sandbox-m2.ll9k.p1.openshiftapps.com/#https://github.com/Gepardec/renovate-playground/tree/postupgradetask/quarkus_2.16.12.final_3.14.3',
      },
    ];

    res.send(pullrequests);
  });

  router.get('/workflowruns', (_, res) => {
    fetchWorfklowRuns().then(wf => res.send(wf));
  });

  const middleware = MiddlewareFactory.create({ logger, config });

  router.use(middleware.error());
  return router;
}

async function fetchWorfklowRuns(): Promise<GeparcedemyView> {
  const geparcademyView: GeparcedemyView = [];
  const idToken = '<SET ME>'; // FIXME from where?
  const workflowruns: Promise<WorkflowRuns> = fetch(
    'https://api.github.com/repos/Gepardec/renovate-playground/actions/runs?status=failure', // TODO github api url as constant
    {
      headers: { Authorization: `Bearer ${idToken}` },
    },
  ).then(rs => rs.json());

  fetchActions(idToken);
  return workflowruns.then(async r => {
    for (const wf of r.workflow_runs) {
      if (wf.pull_requests.length !== 0 && wf.head_branch.startsWith("postupgradetask/")) {
        const geparcedemEntry: GeparcedemyEntry = {
          buildState: '',
          devspaceUrl: '',
          title: '',
          pullRequestUrl: '',
        };

        console.log(`processing ${wf.head_branch}`)
        geparcedemEntry.title = wf.head_branch;
        geparcedemEntry.buildState = wf.conclusion;
        console.log(`pull requests #${wf.pull_requests.length}`);
        geparcedemEntry.pullRequestUrl = wf.pull_requests[0].url;
        if(geparcedemEntry.buildState === "failure") {
          const statusesUrl = await fetchStatusesUrl(idToken, wf.pull_requests[0].url);
          geparcedemEntry.devspaceUrl = await fetchDevspaceUrl(
            idToken,
            statusesUrl,
          );
        }

        geparcademyView.push(geparcedemEntry);
      }
    }
    return geparcademyView;
  });

}

async function fetchStatusesUrl(
  token: string,
  pullRequestUrl: string,
): Promise<string> {
  const rs = await fetch(pullRequestUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const p = await rs.json();
  return p.comments_url;
}

async function fetchDevspaceUrl(
  token: string,
  statusesUrl: string,
): Promise<string> {

  const rs = await fetch(statusesUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const p = await rs.json();
  return p[0].body
    .replace("Click here to review and test in web IDE: [![Contribute](https://img.shields.io/badge/Eclipse_Che-Hosted%20by%20Red%20Hat-525C86?logo=eclipse-che&labelColor=FDB940)](", "")
    .replace(")", "");
}

async function fetchActions(token: string) {
  console.log("---------- FETCH ACTIONS ----------")
  let branches: Branches = await fetch("https://api.github.com/repos/Gepardec/renovate-playground/branches", {
    headers: { Authorization: `Bearer ${token}` },
  }).then(rs => rs.json());
  branches = branches.filter(b => b.name.startsWith("postupgradetask/"));
  for (const b of branches) {
    console.log(`Branch: ${b.name}`);
    const actions: Actions = await fetch(`https://api.github.com/repos/Gepardec/renovate-playground/actions/runs?branch=${b.name}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(rs => rs.json());

    const m = new Map<string, Action>();
    actions.workflow_runs.forEach(a => {
      if(m.has(a.name)) {
        const tmpAction = m.get(a.name);
        if(tmpAction !== undefined && tmpAction.run_number < a.run_number) {
          m.set(a.name, a);
        }
      } else {
        m.set(a.name, a);
      }
    });

    for (const [key, value] of m) {
      console.log(`Action Name: ${key}, Run Number: ${value.run_number}, Conclusion: ${value.conclusion}`);
      const statusesUrl = await fetchStatusesUrl(token, value.pull_requests[0].url);
      const devspaceUrl = await fetchDevspaceUrl(
        token,
        statusesUrl,
      );
      console.log(`DEVSPACE: ${devspaceUrl}`);
    }
  }
  console.log("---------- END: FETCH ACTIONS ----------")
}
