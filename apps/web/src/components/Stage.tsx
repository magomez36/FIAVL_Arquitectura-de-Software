import type { ComponentPropsWithoutRef } from 'react';

export function StageSection(props: ComponentPropsWithoutRef<'section'>) {
  return <section {...props} className={['stage-section', props.className].filter(Boolean).join(' ')}/>;
}

export function StageHeading(props: ComponentPropsWithoutRef<'h2'>) {
  return <h2 {...props} className="stage-heading"/>;
}

export function StageButton(props: ComponentPropsWithoutRef<'button'>) {
  return <button type="button" {...props} className="stage-button"/>;
}

export function StageCard(props: ComponentPropsWithoutRef<'article'>) {
  return <article {...props} className="stage-card"/>;
}

export function StageBadge(props: ComponentPropsWithoutRef<'span'>) {
  return <span {...props} className="stage-badge"/>;
}
