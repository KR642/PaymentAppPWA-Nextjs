// pages/index.js

import { useState } from 'react';

export default function Test() {
  const [data, setData] = useState(null);

  const fetchData = async () => {
    const res = await fetch('/api/getRevolutToken');
    console.log(res);
    const newData = await res.json();
    setData(newData);
  };

  return (
    <div>
      <button onClick={fetchData}>Fetch Revolut Token</button>
      {data && (
        <div>
          <h3>Received Data:</h3>
          <pre>{data}</pre>
        </div>
      )}
    </div>
  );
}
