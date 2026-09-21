import { useState } from 'react';
import { TextField, IconButton, InputAdornment } from '@mui/material';
import { alpha } from '@mui/material/styles';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

const PasswordField = ({ slotProps, sx, ...others }) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <TextField
      {...others}
      type={showPassword ? 'text' : 'password'}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: '14px',
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? alpha('#0f172a', 0.6) : '#ffffff',
          transition: 'all 0.2s ease',
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
            boxShadow: '0 0 0 3px rgba(29, 78, 216, 0.12)',
            '& fieldset': {
              borderColor: '#1d4ed8',
              borderWidth: 1.5,
            },
          },
        },
        ...sx,
      }}
      slotProps={{
        ...slotProps,
        input: {
          ...slotProps?.input,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
                size="small"
                sx={{
                  color: (theme) => (theme.palette.mode === 'dark' ? '#94a3b8' : '#64748b'),
                  borderRadius: '10px',
                  p: 0.75,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    color: '#1d4ed8',
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? alpha('#1d4ed8', 0.15)
                        : 'rgba(29, 78, 216, 0.08)',
                  },
                }}
              >
                {showPassword ? (
                  <VisibilityOffOutlinedIcon fontSize="small" />
                ) : (
                  <VisibilityOutlinedIcon fontSize="small" />
                )}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
};

export default PasswordField;
