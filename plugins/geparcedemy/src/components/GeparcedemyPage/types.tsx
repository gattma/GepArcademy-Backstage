import React from 'react';
import { TableColumn, Link } from '@backstage/core-components';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import CancelOutlinedIcon from '@material-ui/icons/CancelOutlined';

export const geparcedemyColumns: TableColumn[] = [
  {
    title: 'Build',
    field: 'buildState',
    width: "50",
    render: (row: Partial<TableData>) => (
      row.buildState === "failure" ? <CheckCircleOutlineIcon style={{ color: 'green' }}/> : <CancelOutlinedIcon style={{ color: 'red' }} />
    ),
  },
  {
    title: 'Title',
    field: 'title',
    highlight: true,
    render: (row: Partial<TableData>) => (
      <>
        <Link to="{row.pullRequestUrl}">
          {row.title}
        </Link>
      </>
    ),
  },
  {
    title: 'Devspace',
    field: 'devspaceUrl',
    render: (row: Partial<TableData>) => (
      <>
        <Link to="{row.devspaceUrl}">
          <img
            alt="DevSpace"
            src="https://img.shields.io/badge/Eclipse_Che-Hosted%20by%20Red%20Hat-525C86?logo=eclipse-che&labelColor=FDB940"
          />
        </Link>
      </>
    ),
  },
];

interface TableData {
  buildState: string,
  title: string,
  pullRequestUrl: string,
  devspaceUrl: string,
  }

export type Pullrequests = [
  {
    buildState: string,
    title: string,
    pullRequestUrl: string,
    devspaceUrl: string,
  }
]