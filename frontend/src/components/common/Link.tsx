import { forwardRef } from 'react';
import { Link as RouterLink, type LinkProps as RouterLinkProps } from 'react-router-dom';

export interface LinkProps extends Omit<RouterLinkProps, 'to'> {
  href: string;
}

const Link = forwardRef<HTMLAnchorElement, LinkProps>(({ href, ...props }, ref) => {
  const isExternal =
    /^https?:\/\//.test(href) || href.startsWith('mailto:') || href.startsWith('tel:');

  if (isExternal) {
    return <a href={href} ref={ref} {...props} />;
  }

  return <RouterLink to={href} ref={ref} {...props} />;
});

Link.displayName = 'Link';

export default Link;
