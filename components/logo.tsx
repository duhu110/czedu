import type React from "react";

export const LogoIcon = (props: React.ComponentProps<"svg">) => (
	<svg fill="currentColor" viewBox="0 0 24 24" {...props}>
		<text
			x="12"
			y="17"
			textAnchor="middle"
			fontFamily="Arial, Helvetica, sans-serif"
			fontWeight="900"
			fontSize="16"
			letterSpacing="-1"
		>
			E
		</text>
	</svg>
);

export const Logo = (props: React.ComponentProps<"svg">) => (
	<svg
		fill="currentColor"
		viewBox="0 0 90 24"
		xmlns="http://www.w3.org/2000/svg"
		{...props}
	>
		<text
			x="45"
			y="19"
			textAnchor="middle"
			fontFamily="Arial, Helvetica, sans-serif"
			fontWeight="900"
			fontSize="22"
			letterSpacing="4"
		>
			EDU
		</text>
	</svg>
);
