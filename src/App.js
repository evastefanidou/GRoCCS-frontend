import * as React from 'react';
import axios from 'axios';
import { useState } from 'react';
import './App.css';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import { DrawerAppBar } from './components/DrawerAppBar';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Tooltip from '@mui/material/Tooltip';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import CircularProgress from '@mui/material/CircularProgress';
import { Snackbar } from '@mui/material';
import Alert from '@mui/material/Alert';


function App() {
  const[smell, setSmell]= React.useState('');
  const[loading, setLoading] = useState(false); //the loading spinner is not showing
  const[files,setFiles]=useState([]);
  const[uploadPressed, setUploadPressed] = useState(false); //  to track if the Upload button is pressed
  const[gptResponse, setGptResponse]= useState ('');
  const[umlCode, setUmlCode]= useState('');
  const[openSnackbar1,setOpenSnackbar1]= useState(false); // to track the state of the java files selection snackbar
  const[openSnackbar2,setOpenSnackbar2]= useState(false); // to track the state of the upload snackbar
  
  const openNewTab = () => {
    const url = 'https://www.plantuml.com/plantuml/uml/';
    window.open(url, '_blank');
  };

  const handleChange = (event) => {
    setSmell(event.target.value); //event.target.value wste na epistrafei to value tou element sto opoio symbainei to event kai ginetai use h synarthsh
  };

  const copyPumlToClipboard = async (puml) => {
    try { 
      await navigator.clipboard.writeText(puml);
      console.log('PUML code copied to clipboard:', puml);
    } catch (error) {
      console.error('Error while copying PUML code to clipboard:', error);
    }
  };

  function handleFiles(event){
    const fileList = event.target.files; 
    const filesArray = Array.from(fileList);
    console.log(filesArray);
    setFiles(filesArray);
    if(filesArray.length){ //if the user has selected files, open the first snackbar
      setOpenSnackbar1(true); 
    }
  };

  const handleCloseSnackbar1 = () => {
      setOpenSnackbar1(false);          
  };

  const handleUploadSelectedFiles = () => {
    setUploadPressed(true);
    const formData= new FormData();
    // to iterate through each index of the 'files' array
    for (let index = 0; index < files.length; index++) {
    // Append the current file to the FormData object
    // ara 8a exw object {"file0": files[0], "file1":files[1], ...}
    formData.append(`file${index}`, files[index]);
}
    axios.post('http://localhost:8080/uploadFiles', formData)
    .then(response => {
      console.log(response.data);
      setOpenSnackbar2(true);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  };

  const createErrorAlert = () => {
    if (!files.length && uploadPressed) {
      return (
        <Snackbar open={!files.length} autoHideDuration={6000}>
          <Alert severity="error" variant="filled" sx={{ width: '100%' }}>
            No files were uploaded. Please select Java files to upload.
          </Alert>
        </Snackbar>
      );
    }
    return null; // do not open the error snackbar if the condition is not met
  };

  const handleCloseSnackbar2 = () => {
    setOpenSnackbar2(false);
  };

  const handleSendPrompt = () => {
    setLoading(true);
    // To make a request to the backend with the selected option
    axios.post(`http://localhost:8080/chatWithModel?prompt=${smell}`)
      .then(response => {
        // Handle response from backend
        console.log(response.data);
        setGptResponse(response.data);
      })
      .catch(error => {
        // Handle error
        console.error('Error:', error);
        if(error.response){
          setGptResponse(error.response.data);
        }
      })
      .finally(()=>{
        setLoading(false);
      });
  };

  const getPumlCode = () => {
    axios.post(`http://localhost:8080/processPUML?selectedSmell=${smell}`)
      .then(response=> {
        console.log(response.data);
        setUmlCode(response.data);
        copyPumlToClipboard(response.data).then(() => {
          openNewTab(); // Open the new tab after the clipboard copy operation is complete
        });
      })
      .catch(error => {
        console.log(error);
      });
  };
  return (
    <Container maxWidth="sm"  className="container">
           <DrawerAppBar />
            <div id='dropdownList'>
              <FormControl fullWidth>
                <InputLabel>Code Smell</InputLabel>
                <Select
                  value={smell}
                  label="Code Smell"
                  onChange={handleChange}
                >
                  <MenuItem value={"Violation of SOLID Principles"}>
                    <Tooltip title="Detect any violation of SOLID design principles" disableInteractive>
                      Violation of SOLID Principles
                    </Tooltip>
                  </MenuItem>
                  <MenuItem value={"Lack of comments"}>
                    <Tooltip title="Detect classes and methods that lack comments/documentation" disableInteractive>
                      Lack of comments
                    </Tooltip>
                  </MenuItem>
                  <MenuItem value={"Naming of methods/classes does not adhere to conventions"}>
                    <Tooltip title="Detect classes and methods whose naming hinders readability and understandability and does not adhere to naming conventions" disableInteractive>
                      Naming of methods/classes does not adhere to conventions
                    </Tooltip>
                  </MenuItem>
                  <MenuItem value={"Naming of fields does not adhere to conventions"}>
                    <Tooltip title="Detect fields within classes whose naming does not adhere to naming conventions" disableInteractive>
                      Naming of fields does not adhere to conventions
                    </Tooltip>
                  </MenuItem>
                  <MenuItem value={"Complicated methods/classes"}>
                    <Tooltip title="Detect coomplicated methods and classes" disableInteractive>
                      Complicated methods/classes
                    </Tooltip>
                  </MenuItem>
                  <MenuItem value={"High coupling"}>
                    <Tooltip title="Detect classes that depend heavily on other classes by calling their methods or by using their properties and their data" disableInteractive>
                      High coupling
                    </Tooltip>
                  </MenuItem>
                  <MenuItem value={"God class"}>
                    <Tooltip title="Detect classes with multiple responsibilities" disableInteractive>
                      God class
                    </Tooltip>
                  </MenuItem>
                  <MenuItem value={"Duplicate code"}>
                    <Tooltip title="Detect sections of code that are duplicated within or across classes" disableInteractive>
                      Duplicate code
                    </Tooltip>
                  </MenuItem>
                </Select>
              </FormControl>
            </div>
            <Button variant="contained" component="label">  
                Select Files
                <input
                  multiple
                  type="file"
                  accept=".java" 
                  hidden 
                  onChange={handleFiles}
                />
            </Button>
            <Snackbar
                  open={openSnackbar1}
                  onClose={handleCloseSnackbar1}
                  message="The Java files were selected successfully!"
                  autoHideDuration={6000}
            />
            <Button 
                  variant="contained" 
                  startIcon={<CloudUploadIcon />} 
                  onClick={handleUploadSelectedFiles} 
                  style={{ margin: '10px 5px' }}>
                   Upload selected files
            </Button>
            <Snackbar open={openSnackbar2} autoHideDuration={6000} onClose={handleCloseSnackbar2}>
              <Alert 
                  onClose={handleCloseSnackbar2}
                  severity="success"
                  variant="filled"
                  sx={{ width: '100%' }}
              >
                  The selected Java files were successfully uploaded!
              </Alert>
            </Snackbar>
           {createErrorAlert()}
            <Button 
                  variant="contained" 
                  onClick={handleSendPrompt} 
                  disabled={!smell || loading } 
                  endIcon={loading ? <CircularProgress size={24} /> : <SendIcon />} 
                  style={{ margin: '0px 5px' }}>
                    Send prompt 
            </Button> 
              <TextField
                  fullWidth 
                  id="filled-multiline-static"
                  label="GPT response..."
                  multiline
                  rows={9}
                  variant="outlined"
                  style={{ margin: '0px 5px' }}
                  value={gptResponse}
                />
            <Tooltip title="Click here to copy the PlantUML code to clipboard and head to the PlantUML server" arrow>
              <span>
                <Button variant="outlined" onClick= {getPumlCode} style={{ margin: '5px 0' }} endIcon= {<HelpOutlineRoundedIcon />} disabled={!gptResponse}>Generate UML class diagram</Button>
              </span>
            </Tooltip>
      </Container>
  )
}

export default App;
