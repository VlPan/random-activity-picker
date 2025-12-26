import {Container, Typography, Button} from '@mui/material';
// import SendIcon from '@mui/icons-material/Send';
import styles from './Randomizer.module.css';

const Randomizer = () => {
  return (  
    <div className={styles.randomizer}>
      <Container>
      <Typography variant="h4" gutterBottom>
        Welcome to Material Design
      </Typography>
      <Button variant="contained" >
        Send Message
      </Button>
    </Container>
    </div>
  );
}
 
export default Randomizer;
// npm install @mui/icons-material