import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import React from 'react'
import { Params,useLocation, useMatches } from 'react-router-dom';

interface BreadcrumbsProps {

}

interface IMatches {
    id: string;
    pathname: string;
    params: Params<string>;
    data: unknown;
    handle: unknown;
}

type HandleType={
    crumb : (param?: string) => React.ReactNode;
}


const AppBreadcrumb: React.FC<BreadcrumbsProps> = () => {
    const location = useLocation();
    const matches: IMatches[] = useMatches();
    const crumbs = matches.filter((match) => Boolean(match.handle && (match.handle as HandleType).crumb))
    .map((match) => {
        const crumb = (match.handle as HandleType).crumb(location.pathname);
            return crumb as React.ReactNode;
    })

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {
                    crumbs.map((item, index) => (
                        <React.Fragment key={index}>
                            {
                                index > 0 ? <BreadcrumbSeparator/> : null
                            }
                            <BreadcrumbItem>
                                {item}
                            </BreadcrumbItem>
                        </React.Fragment>
                    ))
                }
            </BreadcrumbList>
        </Breadcrumb>
    );
}

export default AppBreadcrumb