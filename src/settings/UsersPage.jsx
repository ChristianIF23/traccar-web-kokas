import { useCallback, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Switch,
  TableFooter,
  FormControlLabel,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import LinkIcon from '@mui/icons-material/Link';
import { useTheme } from '@mui/material/styles';
import { useCatch, useAsyncTask, useScrollToLoad, pageSize } from '../reactHelper';
import { formatTime } from '../common/util/formatter';
import { useTranslation } from '../common/components/LocalizationProvider';
import PageLayout from '../common/components/PageLayout';
import SettingsMenu from './components/SettingsMenu';
import CollectionFab from './components/CollectionFab';
import CollectionActions from './components/CollectionActions';
import TableShimmer from '../common/components/TableShimmer';
import { useManager } from '../common/util/permissions';
import SearchHeader from './components/SearchHeader';
import useSettingsStyles from './common/useSettingsStyles';
import fetchOrThrow from '../common/util/fetchOrThrow';
import UserDevicesValue from './components/UserDevicesValue';

const UsersPage = () => {
  const { classes } = useSettingsStyles();
  const theme = useTheme();
  const navigate = useNavigate();
  const t = useTranslation();

  const manager = useManager();

  const [reloadKey, reload] = useReducer((k) => k + 1, 0);
  const [items, setItems] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [temporary, setTemporary] = useState(false);

  const handleLogin = useCatch(async (userId) => {
    await fetchOrThrow(`/api/session/${userId}`);
    window.location.replace('/');
  });

  const actionLogin = {
    key: 'login',
    title: t('loginLogin'),
    icon: <LoginIcon fontSize="small" />,
    handler: handleLogin,
  };

  const actionConnections = {
    key: 'connections',
    title: t('sharedConnections'),
    icon: <LinkIcon fontSize="small" />,
    handler: (userId) => navigate(`/settings/user/${userId}/connections`),
  };

  const loadItems = useCallback(
    async (offset, signal) => {
      const query = new URLSearchParams({ excludeAttributes: true, limit: pageSize, offset });
      if (searchKeyword) {
        query.append('keyword', searchKeyword);
      }
      const response = await fetchOrThrow(`/api/users?${query.toString()}`, { signal });
      const data = await response.json();
      setItems((previous) => (offset ? [...previous, ...data] : data));
      setHasMore(data.length >= pageSize);
    },
    [searchKeyword],
  );

  const sentinelRef = useScrollToLoad(() => loadItems(items.length));

  useAsyncTask(
    async ({ signal }) => {
      void reloadKey;
      setItems([]);
      await loadItems(0, signal);
    },
    [reloadKey, loadItems],
  );

  return (
    <PageLayout menu={<SettingsMenu />} breadcrumbs={['settingsTitle', 'settingsUsers']}>
      <SearchHeader keyword={searchKeyword} setKeyword={setSearchKeyword} />

      {/* Kontainer Kartu Tabel */}
      <Box
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: '16px',
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          mx: { xs: 1, sm: 2 },
          mb: 4,
        }}
      >
        <Box sx={{ width: '100%', overflowX: 'auto' }}>
          <Table
            className={classes.table}
            sx={{
              minWidth: 750,
              borderCollapse: 'separate',
              borderSpacing: 0,
              '& .MuiTableHead-root .MuiTableCell-root': {
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                color: 'text.secondary',
                fontWeight: 600,
                fontSize: '0.78rem',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                py: 1.8,
                px: 2.5,
                borderBottom: `1px solid ${theme.palette.divider}`,
                whiteSpace: 'nowrap',
              },
              '& .MuiTableBody-root .MuiTableRow-root': {
                transition: 'background-color 0.15s ease',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
                },
              },
              '& .MuiTableBody-root .MuiTableCell-root': {
                py: 1.8,
                px: 2.5,
                fontSize: '0.875rem',
                borderBottom: `1px solid ${theme.palette.divider}`,
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>{t('sharedName')}</TableCell>
                <TableCell>{t('userEmail')}</TableCell>
                <TableCell>{t('userAdmin')}</TableCell>
                <TableCell>{t('sharedDisabled')}</TableCell>
                <TableCell>{t('userExpirationTime')}</TableCell>
                <TableCell>{t('deviceTitle')}</TableCell>
                <TableCell className={classes.columnAction} align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {items
                .filter((u) => temporary || !u.temporary)
                .map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="text.primary">
                        {item.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{item.email}</TableCell>
                    <TableCell>
                      {item.administrator ? (
                        <Chip
                          label="Admin"
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            height: 24,
                            backgroundColor: 'rgba(59, 130, 246, 0.12)',
                            color: '#2563eb',
                            borderRadius: '6px',
                          }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.disabled ? (
                        <Chip
                          label={t('sharedDisabled')}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            height: 24,
                            backgroundColor: 'rgba(239, 68, 68, 0.12)',
                            color: '#dc2626',
                            borderRadius: '6px',
                          }}
                        />
                      ) : (
                        <Chip
                          label="Aktif"
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            height: 24,
                            backgroundColor: 'rgba(34, 197, 94, 0.12)',
                            color: '#16a34a',
                            borderRadius: '6px',
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                      {formatTime(item.expirationTime, 'date') || '—'}
                    </TableCell>
                    <TableCell>
                      <UserDevicesValue userId={item.id} />
                    </TableCell>
                    <TableCell className={classes.columnAction} padding="none" align="right">
                      <CollectionActions
                        itemId={item.id}
                        editPath="/settings/user"
                        endpoint="users"
                        onReload={reload}
                        customActions={manager ? [actionLogin, actionConnections] : [actionConnections]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              {hasMore && (
                <TableShimmer ref={items.length > 0 ? sentinelRef : null} columns={7} endAction />
              )}
            </TableBody>
            <TableFooter>
              <TableRow sx={{ '& .MuiTableCell-root': { py: 1.5, px: 2.5, borderTop: `1px solid ${theme.palette.divider}`, borderBottom: 'none' } }}>
                <TableCell colSpan={7} align="right">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={temporary}
                        onChange={(e) => setTemporary(e.target.checked)}
                        size="small"
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        {t('userTemporary')}
                      </Typography>
                    }
                    labelPlacement="start"
                  />
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </Box>
      </Box>

      <CollectionFab editPath="/settings/user" />
    </PageLayout>
  );
};

export default UsersPage;
