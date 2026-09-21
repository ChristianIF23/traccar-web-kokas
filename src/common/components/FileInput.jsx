import { useRef } from 'react';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import { alpha } from '@mui/material/styles';

const FileInput = ({ placeholder, value, onChange, slotProps, ...props }) => {
  const inputRef = useRef(null);

  const openPicker = () => inputRef.current?.click();

  const handleChange = (event) => {
    onChange?.(event.target.files?.[0] || null);
    event.target.value = '';
  };

  const handleClear = (event) => {
    event.stopPropagation();
    onChange?.(null);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleChange}
        {...slotProps?.htmlInput}
      />
      <TextField
        fullWidth
        size="small"
        value={value?.name ?? ''}
        placeholder={placeholder || 'Pilih file...'}
        onClick={openPicker}
        {...props}
        slotProps={{
          input: {
            readOnly: true,
            startAdornment: (
              <InputAdornment position="start">
                <UploadFileOutlinedIcon
                  fontSize="small"
                  sx={{
                    color: value ? '#1d4ed8' : 'text.secondary',
                    transition: 'color 0.2s ease',
                  }}
                />
              </InputAdornment>
            ),
            endAdornment: value && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  edge="end"
                  onClick={handleClear}
                  sx={{
                    color: 'text.secondary',
                    '&:hover': {
                      color: 'error.main',
                      backgroundColor: (theme) => alpha(theme.palette.error.main, 0.08),
                    },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              cursor: 'pointer',
              borderRadius: '14px',
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark' ? alpha('#0f172a', 0.6) : '#ffffff',
              transition: 'all 0.2s ease',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: (theme) =>
                  value
                    ? '#1d4ed8'
                    : theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.12)'
                      : 'rgba(15, 23, 42, 0.12)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#1d4ed8',
              },
              boxShadow: value ? '0 0 0 3px rgba(29, 78, 216, 0.1)' : 'none',
            },
          },
          htmlInput: {
            sx: {
              cursor: 'pointer',
              textOverflow: 'ellipsis',
              fontSize: '0.86rem',
              fontWeight: value ? 600 : 400,
            },
          },
        }}
      />
    </>
  );
};

export default FileInput;
