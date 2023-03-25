type Props = {
  username: string;
};

const Title = ({ username }: Props) => {
  const toGitHub = `https://github.com/${username}`;

  return (
    <span className="text-4xl font-bold">
      <a href={toGitHub} target="_blank" rel="noreferrer">
        <span className="cursor-pointer font-bold text-blue-600 no-underline hover:underline">{username}</span>
      </a>
      &apos;s kusa
    </span>
  );
};

export default Title;
