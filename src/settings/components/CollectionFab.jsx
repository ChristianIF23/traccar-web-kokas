import { Fab, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { useRestriction } from '../../common/util/permissions';

const CollectionFab = ({ editPath, disabled }) => {
  const navigate = useNavigate();
  const readonly = useRestriction('readonly');

  if (!readonly && !disabled) {
    return (
      <Box
        sx={{
          position: 'fixed',
          bottom: { xs: (theme) => `calc(${theme.dimensions.bottomBarHeight}px + 16px)`, md: 24 },
          right: { xs: 16, md: 24 },
          zIndex: (theme) => theme.zIndex.speedDial || 1050,
        }}
      >
        <Fab
          size="medium"
          color="primary"
          onClick={() => navigate(editPath)}
          sx={{
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 6px 20px rgba(0, 0, 0, 0.4)'
                : '0 8px 24px rgba(25, 118, 210, 0.35)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 8px 24px rgba(0, 0, 0, 0.6)'
                  : '0 10px 28px rgba(25, 118, 210, 0.45)',
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
