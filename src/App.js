import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [svgContent, setSvgContent] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const svgContainerRef = useRef(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('logo', file);

    try {
      const response = await axios.post('http://localhost:3001/convert', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSvgContent(response.data.svg);
      setDimensions({ width: response.data.width, height: response.data.height });
    } catch (error) {
      console.error('Error converting logo:', error);
    }
  };

  const handleDownload = () => {
    if (!svgContent) return;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'converted-logo.svg';
    link.click();
  };

  useEffect(() => {
    if (svgContent && svgContainerRef.current) {
      svgContainerRef.current.innerHTML = svgContent;
      
      // Adjust SVG viewBox to fit container
      const svgElement = svgContainerRef.current.querySelector('svg');
      if (svgElement) {
        const containerWidth = svgContainerRef.current.clientWidth;
        const containerHeight = svgContainerRef.current.clientHeight;
        const aspectRatio = dimensions.width / dimensions.height;
        
        let newWidth, newHeight;
        if (containerWidth / containerHeight > aspectRatio) {
          newHeight = containerHeight;
          newWidth = newHeight * aspectRatio;
        } else {
          newWidth = containerWidth;
          newHeight = newWidth / aspectRatio;
        }
        
        svgElement.setAttribute('width', newWidth);
        svgElement.setAttribute('height', newHeight);
        svgElement.setAttribute('viewBox', `0 0 ${dimensions.width} ${dimensions.height}`);
      }
    }
  }, [svgContent, dimensions]);

  return (
    <div className="App">
      <h1>Logo to SVG Converter</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} accept="image/*" />
        <button type="submit">Convert to SVG</button>
      </form>
      <div 
        ref={svgContainerRef} 
        style={{ width: '100%', height: '400px', border: '1px solid #ccc', marginTop: '20px' }}
      ></div>
          <button onClick={handleDownload} style={{ marginTop: '20px' }}>
            Download SVG
          </button>
    </div>
  );
}

export default App;