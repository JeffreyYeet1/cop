import { useEffect, useState } from 'react';

const StatusBar = () => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`;
      setTime(formattedTime);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 py-3 px-5 flex justify-between items-center z-50 bg-transparent">
      {/* Time */}
      <div className="text-black font-medium text-sm">
        {time}
      </div>

      {/* Status Icons */}
      <div className="flex items-center space-x-1.5">
        {/* Signal Strength */}
        <div className="h-3 w-4">
          <svg viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 10.6667H3V4.66667H1V10.6667ZM5 10.6667H7V1.33334H5V10.6667ZM9 10.6667H11V6.66667H9V10.6667ZM13 10.6667H15V8.66667H13V10.6667Z" fill="black"/>
          </svg>
        </div>

        {/* WiFi */}
        <div className="h-3 w-4">
          <svg viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.41667 9.75L4.41667 6.75C4.91111 6.30556 5.46944 5.96944 6.09167 5.74167C6.71389 5.51389 7.36111 5.4 8.03333 5.4C8.70556 5.4 9.35278 5.51389 9.975 5.74167C10.5972 5.96944 11.1556 6.30556 11.65 6.75L8.65 9.75C8.55 9.85 8.43889 9.9 8.31667 9.9C8.19444 9.9 8.08333 9.85 7.98333 9.75H7.41667ZM3.15 5.48333L2.08333 4.43333C2.96111 3.57778 3.99167 2.90556 5.175 2.41667C6.35833 1.92778 7.595 1.68333 8.88333 1.68333C10.1717 1.68333 11.4083 1.92778 12.5917 2.41667C13.775 2.90556 14.8056 3.57778 15.6833 4.43333L14.6167 5.48333C13.8611 4.75 13.0028 4.17222 12.0417 3.75C11.0806 3.32778 10.0639 3.11667 8.99167 3.11667C7.91944 3.11667 6.90278 3.32778 5.94167 3.75C4.98056 4.17222 4.12222 4.75 3.36667 5.48333H3.15ZM0.333333 2.66667L1.93333 1.05C2.71111 0.316667 3.56667 -0.241667 4.5 -0.625C5.43333 -1.00833 6.38889 -1.2 7.36667 -1.2C8.34444 -1.2 9.3 -1.00833 10.2333 -0.625C11.1667 -0.241667 12.0222 0.316667 12.8 1.05L14.4 2.66667L13.0833 4L11.4833 2.38333C10.8833 1.79444 10.225 1.33333 9.50833 1C8.79167 0.666667 8.04167 0.5 7.25833 0.5C6.475 0.5 5.725 0.666667 5.00833 1C4.29167 1.33333 3.63333 1.79444 3.03333 2.38333L1.41667 4L0.333333 2.66667Z" fill="black"/>
          </svg>
        </div>

        {/* Battery */}
        <div className="h-3 w-6 flex items-center">
          <div className="h-3 w-5 border border-black rounded-sm relative overflow-hidden flex items-center">
            <div className="absolute left-0 top-0 bottom-0 w-3.5 bg-black"></div>
            <div className="absolute right-0 -mr-px w-px h-1.5 bg-black transform translate-x-px"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;