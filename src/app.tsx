/** @jsx Didact.createElement */

import * as Didact from './didact'

const stories = [
  { name: "Didact introduction", url: "http://bit.ly/2pX7HNn" },
  { name: "Rendering DOM elements ", url: "http://bit.ly/2qCOejH" },
  { name: "Element creation and JSX", url: "http://bit.ly/2qGbw8S" },
  { name: "Instances and reconciliation", url: "http://bit.ly/2q4A746" },
  { name: "Components and state", url: "http://bit.ly/2rE16nh" }
];

const rootDom = document.getElementById("root")

function clock() {
  const time = new Date().toLocaleTimeString()
  return <h1>{time}</h1>
}

function storyElement({ name, url }) {
  const likes = Math.ceil(Math.random() * 100);
  return (
    <li>
      <button>{likes}❤️</button>
      <a href={url}>{name}</a>
    </li>
  );
}

const getAppElement = () => <div>
  <ul>
    {stories.map(storyElement)}
  </ul>
  {clock()}
</div>;


setInterval(
  () => Didact.render(getAppElement(), rootDom),
  1000
)
