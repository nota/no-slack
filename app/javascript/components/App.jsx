// import React, { useState } from "react";
// import React, { Suspense } from "react";
// import useSWR from "swr";
import React, { useState, useEffect } from "react";

export default function App() {
  // const fetcher = (url) =>
  //   fetch(url).then(async (res) => {
  //     console.log(await res.json());
  //     return res.json();
  //   });
  // const { items, error, isLoading } = useSWR("/items.json", fetcher);
  const [items, setItems] = useState([]);
  useEffect(() => {
    fetch("/items.json").then((res) => res.json().then(setItems));
  }, []);

  // return <h1>Hello, React with Vite-Rails</h1>;
  console.log(items);
  return (
    <>
      <form action="/items" method="POST">
        <textarea name="item[text]"></textarea>
        <button type="submit">post</button>
      </form>

      <ul>
        {items?.map((item) => {
          return <li key={item._id}>{item.text}</li>;
        })}
      </ul>
    </>
  );
}
