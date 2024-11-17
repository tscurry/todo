import * as React from 'react';

export const CheckboxEmpty = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      viewBox="0 0 21 21"
      fill="currentColor"
      height="1.7em"
      width="1.7em"
      style={{ cursor: 'pointer' }}
      {...props}
    >
      <path
        fill="none"
        stroke="#b2b2b2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.5 3.5h10a2 2 0 012 2v10a2 2 0 01-2 2h-10a2 2 0 01-2-2v-10a2 2 0 012-2z"
      />
    </svg>
  );
};

export const CheckboxFill = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      viewBox="0 0 512 512"
      fill="currentColor"
      height="1.7em"
      width="1.7em"
      style={{ cursor: 'pointer' }}
      {...props}
    >
      <path d="M400 48H112a64.07 64.07 0 00-64 64v288a64.07 64.07 0 0064 64h288a64.07 64.07 0 0064-64V112a64.07 64.07 0 00-64-64zm-35.75 138.29l-134.4 160a16 16 0 01-12 5.71h-.27a16 16 0 01-11.89-5.3l-57.6-64a16 16 0 1123.78-21.4l45.29 50.32 122.59-145.91a16 16 0 0124.5 20.58z" />
    </svg>
  );
};

export const TimeIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" height="1.1em" width="1.1em" {...props}>
      <path d="M12 20c4.42 0 8-3.58 8-8s-3.58-8-8-8-8 3.58-8 8 3.58 8 8 8m0-18c5.5 0 10 4.5 10 10s-4.5 10-10 10C6.47 22 2 17.5 2 12S6.5 2 12 2m.5 11H11V7h1.5v4.26l3.7-2.13.75 1.3L12.5 13z" />
    </svg>
  );
};

export const DotsVertical = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" height="1.3em" width="1.3em" {...props}>
      <path d="M12 16a2 2 0 012 2 2 2 0 01-2 2 2 2 0 01-2-2 2 2 0 012-2m0-6a2 2 0 012 2 2 2 0 01-2 2 2 2 0 01-2-2 2 2 0 012-2m0-6a2 2 0 012 2 2 2 0 01-2 2 2 2 0 01-2-2 2 2 0 012-2z" />
    </svg>
  );
};

export const Menu = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" height="2em" width="2em" {...props}>
      <path d="M4 5h16a1 1 0 010 2H4a1 1 0 110-2zm0 6h16a1 1 0 010 2H4a1 1 0 010-2zm0 6h16a1 1 0 010 2H4a1 1 0 010-2z" />
    </svg>
  );
};

export const MenuClose = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg fill="none" viewBox="0 0 24 24" height="2em" width="2em" {...props}>
      <path
        fill="currentColor"
        d="M6.225 4.811a1 1 0 00-1.414 1.414L10.586 12 4.81 17.775a1 1 0 101.414 1.414L12 13.414l5.775 5.775a1 1 0 001.414-1.414L13.414 12l5.775-5.775a1 1 0 00-1.414-1.414L12 10.586 6.225 4.81z"
      />
    </svg>
  );
};

export const CreateIcon = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg fill="currentColor" viewBox="0 0 16 16" height="1.6em" width="1.6em" {...props}>
      <path d="M8 4a.5.5 0 01.5.5v3h3a.5.5 0 010 1h-3v3a.5.5 0 01-1 0v-3h-3a.5.5 0 010-1h3v-3A.5.5 0 018 4z" />
    </svg>
  );
};

export const Forward = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 512 512" fill="currentColor" height="1em" width="1em" {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={48}
        d="M184 112l144 144-144 144"
      />
    </svg>
  );
};

export const Calendar = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 448 512" fill="currentColor" height="1.4em" width="1.4em" {...props}>
      <path d="M152 64h144V24c0-13.25 10.7-24 24-24s24 10.75 24 24v40h40c35.3 0 64 28.65 64 64v320c0 35.3-28.7 64-64 64H64c-35.35 0-64-28.7-64-64V128c0-35.35 28.65-64 64-64h40V24c0-13.25 10.7-24 24-24s24 10.75 24 24v40zM48 248h80v-56H48v56zm0 48v64h80v-64H48zm128 0v64h96v-64h-96zm144 0v64h80v-64h-80zm80-104h-80v56h80v-56zm0 216h-80v56h64c8.8 0 16-7.2 16-16v-40zm-128 0h-96v56h96v-56zm-144 0H48v40c0 8.8 7.16 16 16 16h64v-56zm144-216h-96v56h96v-56z" />
    </svg>
  );
};

export const IconHome = (props: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" height="1em" width="1em" {...props}>
      <path d="M3 13h1v7c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-7h1a1 1 0 00.707-1.707l-9-9a.999.999 0 00-1.414 0l-9 9A1 1 0 003 13zm7 7v-5h4v5h-4zm2-15.586l6 6V15l.001 5H16v-5c0-1.103-.897-2-2-2h-4c-1.103 0-2 .897-2 2v5H6v-9.586l6-6z" />
    </svg>
  );
};
