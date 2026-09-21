import { Fab, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { alpha, useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useRestriction } from '../../common/util/permissions';

const CollectionFab = ({ editPath, disabled }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const readonly = useRestriction('readonly');

  if (!readonly && !disabled) {
    return (
      <Box
        sx={{
          position: 'fixed',
          bottom: {
            xs: `calc(${theme.dimensions?.bottomBarHeight || 0}px + 16px + env(safe-area-inset-bottom, 0px))`,
            md: 28,
          },
          right: { xs: 20, md: 28 },
          zIndex: theme.zIndex?.speedDial || 1050,
        }}
      >
        <Fab
          size="medium"
          aria-label="add"
          onClick={() => navigate(editPath)}
          sx={{
            backgroundColor: '#1d4ed8',
            color: '#ffffff',
            border: `1px solid ${isDark ? alpha('#ffffff', 0.2) : alpha('#1d4ed8', 0.3)}`,
            boxShadow: isDark
              ? `0 6px 20px rgba(0, 0, 0, 0.6), 0 0 16px ${alpha('#1d4ed8', 0.4)}`
              : `0 8px 24px ${alpha('#1d4ed8', 0.35)}`,
            transition:
              'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease, background-color 0.2s ease',
            '& .MuiSvgIcon-root': {
              transition: 'transform 0.3s ease',
            },
            '&:hover': {
              backgroundColor: '#1e40af',
              transform: 'translateY(-3px) scale(1.03)',
              boxShadow: isDark
                ? `0 10px 28px rgba(0, 0, 0, 0.75), 0 0 20px ${alpha('#1d4ed8', 0.6)}`
                : `0 12px 30px ${alpha('#1d4ed8', 0.45)}`,
              '& .MuiSvgIcon-root': {
                transform: 'rotate(90deg)',
              },
            },
            '&:active': {
              transform: 'translateY(-1px) scale(0.98)',
            },
          }}
        >
          <AddIcon />
        </Fab>
      </Box>
    );
  }
  return null;
};

export default CollectionFab;
