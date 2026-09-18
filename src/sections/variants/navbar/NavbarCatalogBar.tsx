import React from 'react';
import type { BaseSectionProps } from '../../types';
import { hsl } from '../../themeUtils';
import { MobileNavbarNavigation } from './MobileNavbarNavigation';
/** Original canonical rendering of the responsive brand/menu/action arrangement in 21st:606. */
export const NavbarCatalogBar: React.FC<BaseSectionProps<'navbar'>> = ({section,theme}) => {
 const {brand,links=[],cta}=section.props;
 return <header data-ut-variant="navbar:catalog-bar" className="border-b" style={{background:hsl(theme.colors.background),borderColor:hsl(theme.colors.border)}}>
  <MobileNavbarNavigation brand={brand} links={links} cta={cta}/>
  <div className="mx-auto hidden items-center justify-between gap-8 px-6 py-5 lg:flex" style={{maxWidth:theme.containerWidth}}>
   <a href="/" className="text-xl font-semibold" style={{color:hsl(theme.colors.foreground),fontFamily:theme.typography.headingFont}}>{brand}</a>
   <nav aria-label="Main navigation" className="flex flex-wrap gap-6">{links.map((link,i)=><a key={i} href={link.href} data-ut-intent={link.intent} className="text-sm underline-offset-4 hover:underline" style={{color:hsl(theme.colors.mutedForeground)}}>{link.label}</a>)}</nav>
   {cta && <a href={cta.href || '#'} data-ut-intent={cta.intent} data-ut-cta="cta.nav" className="px-5 py-2 text-sm font-medium" style={{borderRadius:theme.radius,background:hsl(theme.colors.primary),color:hsl(theme.colors.primaryForeground)}}>{cta.label}</a>}
  </div></header>;
};
