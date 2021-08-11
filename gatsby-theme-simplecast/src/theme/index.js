module.exports = {
  initialColorModeName: "light",
  breakpoints: ["992px", "1200px", "1920px"],
  space: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 72, 80, 128, 256, 512],
  sizes: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 72, 80, 128, 256, 512],
  fontSizes: [12, 14, 16, 18, 20, 22, 24, 32, 40, 48, 64],
  alerts: {
    success: {
      color: 'text',
      bg: '#4db98f',
    },
    error: {
      color: 'text',
      bg: 'hsl(9, 59%, 46%)',
    },
  },
  colors: {
    text: "rgba(0, 0, 0, 0.9)",
    background: "#f9f9f9",
    backgroundLighten10: "#DFDFDF",
    backgroundLighten20: "#C6C6C6",
    primaryDarken: 'hsl(9, 59%, 35%)',
    primary: 'hsl(9, 59%, 46%)',
    primaryLighten10: 'hsl(9, 59%, 55%)',
    primaryLighten50: 'hsl(9, 59%, 65%)',
    primaryLighten70: 'hsl(9, 59%, 75%)',
    secondary: 'hsl(223, 76%, 39%)',
    gradient: 'linear-gradient(224deg, hsl(9, 59%, 75%) 0%, hsl(9, 59%, 35%) 100%)',
    modes: {
      dark: {
        text: 'rgba(255, 255, 255, 0.9)',
        background: '#1A2232',
        backgroundLighten10: '#232B3B',
        backgroundLighten20: '#2C3648',
        primaryDarken: 'hsl(9, 59%, 35%)',
        primary: 'hsl(9, 59%, 46%)',
        primaryLighten10: 'hsl(9, 59%, 55%)',
        primaryLighten50: 'hsl(9, 59%, 65%)',
        primaryLighten70: 'hsl(9, 59%, 75%)',
        secondary: 'hsl(223, 76%, 39%)',
        gradient: 'linear-gradient(224deg, hsl(9, 59%, 75%) 0%, hsl(9, 59%, 35%) 100%)',
      }
    },
  },
  radii: [5, "50%"],
  fontWeights: {
    body: 300,
    heading: 500,
  },
  lineHeights: {
    body: 1.675,
    heading: 1.125,
  },
  letterSpacings: {
    heading: "1.5",
  },
  fonts: {
    body: "system-ui, sans-serif",
    heading: "inherit",
  },
  header: {
    logo: {
      flexDirection: "column",
      justifyContent: "center",
      a: { textDecoration: "none" },
      container: {
        p: 3,
        display: ["flex", "none"],
        visibility: ["visible", "hidden"],
        width: "100%",
        justifyContent: "space-between",
        alignItems: "center",
      },
    },
  },

  styles: {
    color: "primary",
    spinner: {
      color: 'white'
    },
    Header: {
      position: "relative",
      display: "flex",
      flexDirection: "column",
      width: "100%",
      height: [300, 400],
      color: "text",
      h1: { fontSize: [6, 8], textShadow: "0 2px 5px rgba(0,0,0,0.2)" },
      "h1, h5": { m: 0 },
      h5: { mt: 1, fontSize: 1, opacity: 0.6 },
      ".header_content": {
        width: "100%",
        height: "100%",
        position: "absolute",
        //pb: [5, 8],
        px: [5, 8],
        zIndex: 1,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-end",
        button: {
          width: "100%",
          maxWidth: 7,
          height: 7,
          background: "transparent",
          border: "1px solid",
          borderColor: "text",
          color: "text",
          fontSize: "10px",
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          mr: 3,
          mt: 2,
          svg: {
            mt: "1px",
            ml: "2px",
          },
        },
      },
    },
    root: {
      ".episodes_list": {
        backgroundColor: "background",
        position: ["absolute", "fixed"],
        overflowY: ["none", "scroll"],
        zIndex: 2,
        width: "100%",
        maxWidth: ["100%", 300],
        maxHeight: [ "unset", "100vh"],
        px: 5,
        pt: 40,
        a: {
          textDecoration: "none",
          color: "text",
          fontSize: 3,
          fontWeight: "heading",
        },
        li: {
          py: 0,
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          ".summary": {
            fontSize: '14px',
            fontWeight: 300,
            opacity: 0.7
          },
          ".active": {
            borderLeft: "3px solid",
            borderColor: "primary",
            backgroundColor: "backgroundLighten10",
          },
          a: {
            px: 5,
            py: 4,
            borderLeft: "3px solid",
            borderColor: "background",
            fontSize: 4,
            width: "100%",
          },
          ":hover": {
            a: { borderColor: "backgroundLighten10" },
            ".active": {
              borderColor: "primary",
            },
            button: {
              opacity: 1,
              ":hover": {
                opacity: 1,
              },
            },
          },
          h4: {
            mb: 0,
          },
          button: {
            position: "absolute",
            opacity: 0,
            ml: -3,
            backgroundColor: "background",
            border: "1px solid",
            borderColor: "text",
            color: "text",
            display: "flex",
            width: "100%",
            maxWidth: "24px",
            height: "24px",
            flexGrow: "1",
            borderRadius: "50%",
            alignItems: "center",
            justifyContent: "center",
            svg: { mt: "1px", ml: "1px" },
            cursor: "pointer",
          },
        },
      },
      "[data-reach-skip-link]": {
        border: "0",
        clip: "rect(0 0 0 0)",
        height: "1px",
        width: "1px",
        margin: "-1px",
        padding: "0",
        overflow: "hidden",
        position: "absolute",
        zIndex: "999",
      },
      "[data-reach-skip-link]:focus": {
        padding: "1rem",
        position: "fixed",
        top: "10px",
        left: "10px",
        backgroundColor: "background",
        width: "auto",
        height: "auto",
        clip: "auto",
      },
      backgroundColor: "background",
      lineHeight: "body",
      fontFamily: "body",
      fontSize: [2, 3],
      color: "text",
      bg: "background",
      a: {
        color: "primaryLighten50",
      },
      "a:hover": {
        color: "primaryLighten70",
      },
      article: {
        p: [5, 8],
        pb: [2, 14]
      },
      ".sidebar": {
        display: "flex",
        flexDirection: "column",
        p: [5, 8],
        pb: [13, 8],
        width: "100%",
        maxWidth: ["100%", 250],
        fontSize: "15px",
        h5: { my: 4, fontSize: 3 },
        "h5:not(:first-of-type)": { mb: 10, mt: 0 },
        ".guest": {
          fontSize: 1,
          textTransform: "uppercase",
          opacity: 0.8,
          fontWeight: "body",
        },

        li: {
          mb: 2,
          display: "flex",
          a: { color: "text" },
          svg: {
            mt: 1,
            mr: 1,
            width: "100%",
            maxWidth: 3,
            color: "text",
            opacity: 0.5,
          },
        },
      },
      hr: {
        backgroundColor: "backgroundLighten10",
        height: "2px",
      },
    },
    Container: {
      maxWidth: 1200,
    },
    a: {
      color: "primary",
      textDecoration: "none",
      ":hover": {
        color: "secondary",
        textDecoration: "underline",
      },
    },
  },
}
