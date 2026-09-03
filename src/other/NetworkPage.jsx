import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Typography,
  Container,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Box,
  Skeleton,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import { useNavigate, useParams } from 'react-router-dom';
import CellTowerIcon from '@mui/icons-material/CellTower';
import WifiIcon from '@mui/icons-material/Wifi';
import { useAsyncTask } from '../reactHelper';
import BackIcon from '../common/components/BackIcon';
import fetchOrThrow from '../common/util/fetchOrThrow';

const useStyles = makeStyles()((theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.default : '#f8fafc',
  },
  content: {
    overflow: 'auto',
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(3),
  },
}));

const NetworkPage = () => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const { positionId } = useParams();

  const [item, setItem] = useState({});
  const [loading, setLoading] = useState(true);

  useAsyncTask(
    async ({ signal }) => {
      if (positionId) {
        setLoading(true);
        try {
          const response = await fetchOrThrow(`/api/positions?id=${positionId}`, { signal });
          const positions = await response.json();
          if (positions.length > 0) {
            setItem(positions[0]);
          }
        } finally {
          setLoading(false);
        }
      }
    },
    [positionId],
  );

  const deviceName = useSelector((state) => {
    if (item?.deviceId) {
      const device = state.devices.items[item.deviceId];
      if (device) {
        return device.name;
      }
    }
    return null;
  });

  const cellTowers = item.network?.cellTowers || [];
  const wifiPoints = item.network?.wifiAccessPoints || [];

  return (
    <div className={classes.root}>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          backgroundColor: (theme) => theme.palette.background.paper,
        }}
      >
        <Toolbar>
          <IconButton edge="start" sx={{ mr: 2 }} onClick={() => navigate(-1)}>
            <BackIcon />
          </IconButton>
          <Box>
            <Typography variant="h6" fontWeight={600} color="text.primary">
              {deviceName || (loading ? <Skeleton width={130} /> : 'Data Jaringan')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID Posisi: #{positionId}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <div className={classes.content}>
        {/* Cell Towers Table */}
        <Container maxWidth="md">
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: '16px',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            }}
          >
            <Box
              sx={{
                p: 2,
                px: 2.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#ffffff',
              }}
            >
              <CellTowerIcon color="primary" fontSize="small" />
              <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                Cell Towers (BTS)
              </Typography>
            </Box>

            <Table size="small">
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
                  }}
                >
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.secondary', py: 1.5 }}>
                    MCC
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.secondary', py: 1.5 }}>
                    MNC
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.secondary', py: 1.5 }}>
                    LAC
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.secondary', py: 1.5 }}>
                    CID
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                    </TableRow>
                  ))
                ) : cellTowers.length > 0 ? (
                  cellTowers.map((cell, idx) => (
                    <TableRow
                      key={cell.cellId || idx}
                      hover
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.825rem', py: 1.25 }}>
                        {cell.mobileCountryCode}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.825rem', py: 1.25 }}>
                        {cell.mobileNetworkCode}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.825rem', py: 1.25 }}>
                        {cell.locationAreaCode}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.825rem', py: 1.25 }}>
                        {cell.cellId}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Tidak ada data cell tower
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>

        {/* Wi-Fi Access Points Table */}
        <Container maxWidth="md">
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: '16px',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
            }}
          >
            <Box
              sx={{
                p: 2,
                px: 2.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#ffffff',
              }}
            >
              <WifiIcon color="primary" fontSize="small" />
              <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                Wi-Fi Access Points
              </Typography>
            </Box>

            <Table size="small">
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
                  }}
                >
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.secondary', py: 1.5 }}>
                    MAC Address
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem', color: 'text.secondary', py: 1.5 }}>
                    Signal Strength (RSSI)
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                    </TableRow>
                  ))
                ) : wifiPoints.length > 0 ? (
                  wifiPoints.map((wifi, idx) => (
                    <TableRow
                      key={wifi.macAddress || idx}
                      hover
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.825rem', py: 1.25 }}>
                        {wifi.macAddress}
                      </TableCell>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.825rem', py: 1.25 }}>
                        {wifi.signalStrength} dBm
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} align="center" sx={{ py: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Tidak ada data titik Wi-Fi
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </div>
    </div>
  );
};

export default NetworkPage;
