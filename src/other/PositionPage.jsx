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
import { useAsyncTask } from '../reactHelper';
import { useTranslation } from '../common/components/LocalizationProvider';
import PositionValue from '../common/components/PositionValue';
import usePositionAttributes from '../common/attributes/usePositionAttributes';
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
  },
}));

const PositionPage = () => {
  const { classes } = useStyles();
  const navigate = useNavigate();
  const t = useTranslation();

  const positionAttributes = usePositionAttributes(t);
  const { id } = useParams();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useAsyncTask(
    async ({ signal }) => {
      if (id) {
        setLoading(true);
        try {
          const response = await fetchOrThrow(`/api/positions?id=${id}`, { signal });
          const positions = await response.json();
          if (positions && positions.length > 0) {
            setItem(positions[0]);
          } else {
            setItem(null);
          }
        } catch (error) {
          if (error.name !== 'AbortError') {
            // Log atau handle error visual jika diperlukan
            console.error('Failed to fetch position:', error);
          }
        } finally {
          setLoading(false);
        }
      }
    },
    [id],
  );

  const deviceName = useSelector((state) => {
    if (item && item.deviceId) {
      const device = state.devices?.items?.[item.deviceId];
      if (device) {
        return device.name;
      }
    }
    return null;
  });

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
              {deviceName || (loading ? <Skeleton width={120} /> : t('reportPositions'))}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              ID Posisi: #{id}
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <div className={classes.content}>
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
            <Table size="small">
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc',
                  }}
                >
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.8125rem',
                      color: 'text.secondary',
                      py: 1.5,
                      width: '30%',
                    }}
                  >
                    {t('stateName')}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.8125rem',
                      color: 'text.secondary',
                      py: 1.5,
                      width: '35%',
                    }}
                  >
                    {t('sharedName')}
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.8125rem',
                      color: 'text.secondary',
                      py: 1.5,
                      width: '35%',
                    }}
                  >
                    {t('stateValue')}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <TableRow key={`skeleton-${i}`}>
                      <TableCell>
                        <Skeleton />
                      </TableCell>
                      <TableCell>
                        <Skeleton />
                      </TableCell>
                      <TableCell>
                        <Skeleton />
                      </TableCell>
                    </TableRow>
                  ))
                ) : item ? (
                  <>
                    {Object.getOwnPropertyNames(item)
                      .filter((it) => it !== 'attributes')
                      .map((property) => (
                        <TableRow
                          key={`prop-${property}`}
                          hover
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                            transition: 'background-color 0.15s ease',
                          }}
                        >
                          <TableCell
                            sx={{
                              fontFamily: 'monospace',
                              fontSize: '0.8rem',
                              color: 'text.secondary',
                              py: 1.25,
                            }}
                          >
                            {property}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: '0.85rem',
                              fontWeight: 500,
                              color: 'text.primary',
                              py: 1.25,
                            }}
                          >
                            {positionAttributes[property]?.name || '-'}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: '0.85rem',
                              color: 'text.primary',
                              py: 1.25,
                            }}
                          >
                            <PositionValue position={item} property={property} />
                          </TableCell>
                        </TableRow>
                      ))}

                    {item.attributes &&
                      Object.getOwnPropertyNames(item.attributes).map((attribute) => (
                        <TableRow
                          key={`attr-${attribute}`}
                          hover
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                            transition: 'background-color 0.15s ease',
                          }}
                        >
                          <TableCell
                            sx={{
                              fontFamily: 'monospace',
                              fontSize: '0.8rem',
                              color: 'text.secondary',
                              py: 1.25,
                            }}
                          >
                            {attribute}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: '0.85rem',
                              fontWeight: 500,
                              color: 'text.primary',
                              py: 1.25,
                            }}
                          >
                            {positionAttributes[attribute]?.name || '-'}
                          </TableCell>
                          <TableCell
                            sx={{
                              fontSize: '0.85rem',
                              color: 'text.primary',
                              py: 1.25,
                            }}
                          >
                            <PositionValue position={item} attribute={attribute} />
                          </TableCell>
                        </TableRow>
                      ))}
                  </>
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                      {t('sharedNoData') || 'Data tidak ditemukan'}
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

export default PositionPage;
