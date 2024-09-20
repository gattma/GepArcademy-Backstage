import React from 'react';
import useAsync from 'react-use/lib/useAsync';
import { Table } from '@backstage/core-components';
import { Box, Grid, Typography } from '@material-ui/core';
import {
  configApiRef,
  identityApiRef,
  useApi,
} from '@backstage/core-plugin-api';
import { geparcedemyColumns, Pullrequests } from './types';

export const GeparcedemyPage = () => {
  const config = useApi(configApiRef);
  const identityApi = useApi(identityApiRef);
  const SYS_INFO_BACKEND_URL = 'backend.baseUrl';

  const { loading: isLoading, value: pullrequests } =
    useAsync(async (): Promise<Pullrequests> => {
      const backendUrl = config.getString(SYS_INFO_BACKEND_URL);
      const backendApiEndPoint = `${backendUrl}/api/geparcedemy/workflowruns`;

      const { token: idToken } = await identityApi.getCredentials();
      return await fetch(backendApiEndPoint, {
        method: 'GET',
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
        },
      })
        .then(res => (res.ok ? res : Promise.reject(res)))
        .then(res => res.json());
    }, []);

  return (
    <>
      <Grid style={{ marginTop: '1rem' }} container spacing={2}>
        <Grid item xs={10}>
          <Table
            title="Geparcedemy"
            columns={geparcedemyColumns}
            isLoading={isLoading}
            data={pullrequests || []}
            options={{
              padding: 'dense',
              pageSize: 10,
              emptyRowsWhenPaging: false,
              search: true,
            }}
            emptyContent={
              <Box style={{ textAlign: 'center', padding: '15px' }}>
                <Typography variant="body1">Backend data NOT found</Typography>
              </Box>
            }
          />
        </Grid>
      </Grid>
    </>
  );
};