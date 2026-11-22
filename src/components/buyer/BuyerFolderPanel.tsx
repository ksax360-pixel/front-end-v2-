import type { ReactNode } from "react";

type Props = {
  /** Single open tab label (EN/AR already resolved by caller) */
  tabLabel: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
};

/** One open folder tab + attached white panel — same chrome as Requests. */
export function BuyerFolderPanel({ tabLabel, children, className = "", bodyClassName = "" }: Props) {
  return (
    <div className={`vrq-folder${className ? ` ${className}` : ""}`}>
      <div className="vrq-tabs" role="presentation">
        <span className="is-on" aria-current="page">
          {tabLabel}
        </span>
      </div>
      <div className={`vrq-body${bodyClassName ? ` ${bodyClassName}` : ""}`}>{children}</div>
    </div>
  );
}
