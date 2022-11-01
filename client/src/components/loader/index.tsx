import { useEffect, useState } from 'react';
import './index.css';

const Loader = ({ width, percent }: { width: number; percent: number }) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    setValue(percent * width);
  }, []);

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="progress-div" style={{ width: width }}>
        <div style={{ width: `${value}px` }} className="progress" />
      </div>
    </div>
  );
};

export default Loader;
