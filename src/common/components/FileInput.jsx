import { useRef } from 'react';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';

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
                  sx={{ color: value ? 'primary.main' : 'text.secondary' }}
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
                    '&:hover': { color: 'error.main' },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              cursor: 'pointer',
              borderRadius: '10px',
              backgroundColor: 'background.paper',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              '&:hover': {
                borderColor: 'primary.main',
              },
            },
          },
          htmlInput: {
            sx: {
              cursor: 'pointer',
              textOverflow: 'ellipsis',
              fontSize: '0.875rem',
            },
          },
        }}
      />
    </>
  );
};

export default FileInput;
