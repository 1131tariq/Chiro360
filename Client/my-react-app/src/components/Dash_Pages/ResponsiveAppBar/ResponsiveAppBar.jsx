import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import MenuIcon from "@mui/icons-material/Menu";
import AdbIcon from "@mui/icons-material/Adb";

const allPages = {
  Chiropractor: ["Schedule", "Patients", "SOAP", "Billing", "Analytics"],
  "Massage Therapist": ["Schedule", "Patients", "SOAP", "Billing", "Analytics"],
  Nutritionist: ["Schedule", "Patients", "SOAP", "Billing", "Analytics"],
  Acupuncturist: ["Schedule", "Patients", "SOAP", "Billing", "Analytics"],
  Phlebotomist: ["Schedule", "Patients", "SOAP", "Billing", "Analytics"],
  Neurofeedback: ["Schedule", "Patients", "SOAP", "Billing", "Analytics"],
  "Stretch Therapist": ["Schedule", "Patients", "SOAP", "Billing", "Analytics"],
  "Nurse Practitioner": [
    "Schedule",
    "Patients",
    "SOAP",
    "Billing",
    "Analytics",
  ],
  "Medical Doctor": ["Schedule", "Patients", "SOAP", "Billing", "Analytics"],
  "Medical Assistant": ["Schedule", "Patients", "SOAP", "Billing", "Analytics"],
  "Physician Assistant": [
    "Schedule",
    "Patients",
    "SOAP",
    "Billing",
    "Analytics",
  ],
  "Mental Health": ["Schedule", "Patients", "SOAP", "Billing", "Analytics"],
  "General Provider": ["Schedule", "Patients", "SOAP", "Billing", "Analytics"],
  "Administrative only": [
    "Schedule",
    "Patients",
    "Billing",
    "Analytics",
    "Inventory",
  ],
  "Call Agent": ["Schedule", "Patients", "Leads", "Analytics"],
};

const allSettings = {
  "System Admin": ["Profile", "System Settings", "Logout"],
  "Location Admin": ["Profile", "System Settings", "Logout"], // Exclude System Settings
  "Location User": ["Profile", "Logout"], // Exclude System Settings
  "Call Agent": ["Profile", "Logout"], // Exclude System Settings
};

function ResponsiveAppBar({ setCurrentView, userInfo }) {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleMenuItemClick = (page) => {
    setCurrentView(page.toLowerCase().replace(" ", "-"));
    handleCloseNavMenu(); // Close the menu after selection
    handleCloseUserMenu();
  };

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  // Safeguard for userInfo
  const userPermissionLevel = userInfo?.permission_level || "Location User";
  const userType = userInfo?.user_kind || "Call Agent";
  const userPages = allPages[userType] || allPages["Call Agent"];
  const userSettings =
    allSettings[userPermissionLevel] || allSettings["Location User"];

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="a"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            Chiro360°
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              {userPages.map((page) => (
                <MenuItem key={page} onClick={() => handleMenuItemClick(page)}>
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
          <AdbIcon
            onClick={() => {
              handleMenuItemClick("home");
            }}
            sx={{ display: { xs: "flex", md: "none" }, mr: 1 }}
          />
          <Typography
            variant="h5"
            noWrap
            component="a"
            onClick={() => {
              handleMenuItemClick("home");
            }}
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
            }}
          >
            Chiro360
          </Typography>
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {userPages.map((page) => (
              <Button
                key={page}
                onClick={() => {
                  handleMenuItemClick(page);
                }}
                sx={{ my: 2, color: "white", display: "block" }}
              >
                {page}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar
                  alt={userInfo?.firstname || "User"}
                  src="/static/images/avatar/2.jpg"
                />
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: "45px" }}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {userSettings.map((setting) => (
                <MenuItem
                  key={setting}
                  onClick={() => {
                    handleMenuItemClick(setting);
                  }}
                >
                  <Typography textAlign="center">{setting}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default ResponsiveAppBar;
