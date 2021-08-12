const config = {
  initialColorMode: 'dark',
  colors: {
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
    imageFilter: 'none',
    shadowRight: '5px 0 10px rgb(0 0 0 / 70%)',
    shadow: '3px 3px 7px rgba(0, 0, 0, 0.9)',
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
        imageFilter: 'none',
        shadowRight: '5px 0 10px rgb(0 0 0 / 70%)',
      },
      light: {
        text: "rgba(0, 0, 0, 0.9)",
        background: "#f9f9f9",
        backgroundLighten10: "#DFDFDF",
        backgroundLighten20: "#C6C6C6",
        primaryDarken: 'hsl(9, 59%, 45%)',
        primary: 'hsl(9, 59%, 50%)',
        primaryLighten10: 'hsl(9, 59%, 55%)',
        primaryLighten50: 'hsl(9, 59%, 60%)',
        primaryLighten70: 'hsl(9, 59%, 65%)',
        secondary: 'hsl(223, 76%, 39%)',
        gradient: 'linear-gradient(224deg, hsl(9, 59%, 75%) 0%, hsl(9, 59%, 50%) 100%)',
        imageFilter: 'brightness(175%) opacity(80%)',
        shadowRight: '5px 0 10px rgb(0 0 0 / 10%)',
      }
    },
  },
  styles: {
    spinner: {
      color: 'white',
    },
  }
}

module.exports = config
