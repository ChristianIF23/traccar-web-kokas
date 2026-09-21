import { useState, useEffect, useRef } from 'react';
import { TextField, InputAdornment, IconButton, Box } from '@mui/material';
import { alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useTranslation } from '../../common/components/LocalizationProvider';

const SearchHeader = ({ keyword, setKeyword }) => {
  const t = useTranslation();

  const [input, setInput] = useState(keyword);
  const timerRef = useRef();

  useEffect(() => {
    setInput(keyword);
  }, [keyword]);

  useEffect(() => {
    timerRef.current = setTimeout(() => setKeyword(input), 400);
    return () => clearTimeout(timerRef.current);
  }, [input, setKeyword]);

  const handleClear = () => {
    setInput('');
    setKeyword('');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        width: '100%',
      }}
    >
      <TextField
        variant="outlined"
        size="small"
        placeholder={t('sharedSearch')}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        sx={{
          width: { xs: '100%', sm: 380, md: 420 },
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? alpha('#0f172a', 0.8) : '#ffffff',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            transition: 'all 0.2s ease-in-out',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 4px 12px rgba(0, 0, 0, 0.25)'
                : '0 2px 8px rgba(15, 23, 42, 0.04)',
            '& fieldset': {
              borderColor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.12)'
                  : 'rgba(15, 23, 42, 0.12)',
            },
            '&:hover fieldset': {
              borderColor: '#1d4ed8',
            },
            '&.Mui-focused': {
              boxShadow: `0 0 0 3px ${alpha('#1d4ed8', 0.18)}`,
              '& fieldset': {
                borderColor: '#1d4ed8',
                borderWidth: '1px',
              },
            },
          },
          '& .MuiOutlinedInput-input': {
            fontSize: '0.875rem',
            py: 1.1,
          },
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
              </InputAdornment>
            ),
            endAdornment: input ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClear} edge="end">
                  <ClearIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          },
        }}
      />
    </Box>
  );
};

export default SearchHeader;
