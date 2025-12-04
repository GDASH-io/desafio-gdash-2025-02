import React, { ReactNode } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";

interface Props {
	children?: ReactNode;
}

export function Providers({ children }: Props) {
	return (
		<RouterProvider router={router}>
			{children}
		</RouterProvider>
	);
}



