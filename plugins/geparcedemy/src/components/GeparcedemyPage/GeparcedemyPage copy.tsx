import React from 'react';
import useAsync from 'react-use/lib/useAsync';
import { Table } from '@backstage/core-components';
import { Box, Grid, Typography } from '@material-ui/core';
import { configApiRef, useApi, identityApiRef } from '@backstage/core-plugin-api';
import { SysInfoData, sysInfoCpuColumns, sysInfoMainDataColumns } from './types';

export const GeparcedemyPageCPY = () => {
  const config = useApi(configApiRef);
  const identityApi = useApi(identityApiRef);
  const SYS_INFO_BACKEND_URL = 'backend.baseUrl';

  const { loading: isSysInfoLoading, value: sysInfoData } =
    useAsync(async (): Promise<SysInfoData> => {
      console.log("marko")
            
      identityApi.getCredentials().then(token => {
          console.log(token)
      })
      const backendUrl = config.getString(SYS_INFO_BACKEND_URL);
      const backendApiEndPoint = `${backendUrl}/api/geparcedemy/system-info`;

      const { token: idToken } = await identityApi.getCredentials();
      const systemInfoData = await fetch(backendApiEndPoint, {
        method: 'GET',
        headers: {
          ...(idToken && { Authorization: `Bearer ${idToken}` }),
        },
      })
        .then((res) => (res.ok ? res : Promise.reject(res)))
        .then((res) => res.json());

      // To display the main data in a table, prepare the array to contain the ONLY data we have
      systemInfoData.mainDataAsArray = [];
      systemInfoData.mainDataAsArray[0] = systemInfoData.data;
      systemInfoData.mainDataAsArray[0].cpuModel = systemInfoData.cpus[0].model;
      systemInfoData.mainDataAsArray[0].cpuSpeed = systemInfoData.cpus[0].speed;

      return systemInfoData;
    }, []);

  return (
    <>
      <Grid style={{ marginTop: '1rem' }} container spacing={2}>
        <Grid item xs={10}>
          <Table
            title="System Info Details"
            columns={sysInfoMainDataColumns}
            isLoading={isSysInfoLoading}
            data={sysInfoData?.mainDataAsArray || []}
            options={{
              padding: 'dense',
              pageSize: 1,
              emptyRowsWhenPaging: false,
              search: false,
            }}
            emptyContent={
              <Box style={{ textAlign: 'center', padding: '15px' }}>
                <Typography variant="body1">Backend data NOT found</Typography>
              </Box>
            }
          />
        </Grid>

        <Grid item xs={10}>
          <Table
            title="System Info Details - CPUs"
            columns={sysInfoCpuColumns}
            isLoading={isSysInfoLoading}
            data={sysInfoData?.cpus || []}
            options={{
              padding: 'dense',
              pageSize: 10,
              emptyRowsWhenPaging: false,
              search: false,
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