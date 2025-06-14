import React from 'react';
import { 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
  Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { 
  Sort as SortIcon, 
  Search as SearchIcon,
  AccessTime as TimeIcon,
  DateRange as DateIcon
} from '@mui/icons-material';

/**
 * Component for filtering and sorting sessions
 */
export default function SessionsFilter({ 
  selectedDate, 
  onDateChange, 
  sortOption, 
  onSortChange, 
  searchQuery, 
  onSearchChange 
}) {
  return (
    <Box 
      sx={{ 
        mb: 4, 
        p: 2,
        borderRadius: 2,
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
      }}
    >
      <Box 
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { md: 'center' },
          justifyContent: 'space-between',
          gap: 2
        }}
      >
        {/* Date Picker */}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Date"
            value={selectedDate}
            onChange={onDateChange}
            renderInput={(params) => <TextField {...params} />}
            slotProps={{
              textField: {
                sx: { 
                  minWidth: { xs: '100%', md: '200px' } 
                },
                variant: "outlined",
                InputProps: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <DateIcon color="primary" />
                    </InputAdornment>
                  ),
                }
              }
            }}
          />
        </LocalizationProvider>
        
        {/* Search Field */}
        <TextField
          label="Search"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          placeholder="Search by body region or session type"
        />
      </Box>
      
      <Box 
        sx={{
          display: 'flex',
          alignItems: 'center',
          mt: 2,
          gap: 2,
          flexWrap: { xs: 'wrap', md: 'nowrap' }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SortIcon 
            color="primary" 
            sx={{ mr: 1, fontSize: '1.2rem' }} 
          />
          <Typography 
            variant="body2" 
            color="primary"
            sx={{ fontWeight: 500 }}
          >
            Sort by:
          </Typography>
        </Box>
        
        <ToggleButtonGroup
          value={sortOption}
          exclusive
          onChange={(e, newValue) => {
            if (newValue) onSortChange(newValue);
          }}
          aria-label="sort options"
          size="small"
          sx={{ 
            flexWrap: 'wrap', 
            '& .MuiToggleButton-root': {
              border: '1px solid rgba(37, 99, 235, 0.2)',
              color: 'text.secondary',
              '&.Mui-selected': {
                backgroundColor: 'rgba(37, 99, 235, 0.08)',
                color: '#2563eb',
                fontWeight: 500
              }
            }
          }}
        >
          <ToggleButton value="newest">
            <TimeIcon sx={{ mr: 0.5, fontSize: '0.9rem' }} />
            Newest First
          </ToggleButton>
          <ToggleButton value="oldest">
            <TimeIcon sx={{ mr: 0.5, fontSize: '0.9rem' }} />
            Oldest First
          </ToggleButton>
          <ToggleButton value="bodyRegion">
            Body Region
          </ToggleButton>
          <ToggleButton value="sessionType">
            Session Type
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Box>
  );
}
