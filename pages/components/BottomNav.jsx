import { useRouter } from 'next/router';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import HomeIcon from '@mui/icons-material/Home';
import ContactsIcon from '@mui/icons-material/Contacts';
import SettingsIcon from '@mui/icons-material/Settings';
import { useState, useEffect } from 'react';

export default function BottomNav() {
  const router = useRouter();
  const [value, setValue] = useState(0);

  // This effect will set the value based on the route when the component mounts
  useEffect(() => {
    switch (router.pathname) {
      case '/contact':
        setValue(0);
        break;
      case '/Home':
        setValue(1);
        break;
      case '/settings':
        setValue(2);
        break;
      default:
        break;
    }
  }, [router.pathname]);

  const handleChange = (event, newValue) => {
    setValue(newValue);

    switch (newValue) {
      case 0:
        router.push('/contact');
        break;
      case 1:
        router.push('/Home');
        break;
      case 2:
        router.push('/settings');
        break;
      default:
        break;
    }
  };

  return (
    <BottomNavigation
      value={value}
      onChange={handleChange}
      showLabels
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
    >
      <BottomNavigationAction label="Contact" icon={<ContactsIcon />} />
      <BottomNavigationAction label="Home" icon={<HomeIcon />} />
      <BottomNavigationAction label="Settings" icon={<SettingsIcon />} />
    </BottomNavigation>
  );
}
