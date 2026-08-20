import React from "react";

type Props = {
  from:string;
  children: React.ReactNode;
};

export default function Container({ from,children }: Props, ) {
  return from === "main" ? (
		<main className="mx-auto max-w-screen px-6">{children}</main>
	) : (
		<div className="mx-auto max-w-screen ">{children}</div>
	);
}
