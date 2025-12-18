import { Elysia } from "elysia";
declare const app: Elysia<"", {
    decorator: {};
    store: {};
    derive: {};
    resolve: {};
}, {
    typebox: {};
    error: {};
} & {
    typebox: {};
    error: {};
} & {
    typebox: import("@sinclair/typebox").TModule<{}>;
    error: {};
}, {
    schema: {};
    standaloneSchema: {};
    macro: {};
    macroFn: {};
    parser: {};
    response: {};
} & {
    schema: {};
    standaloneSchema: {};
    macro: {};
    macroFn: {};
    parser: {};
    response: {};
} & {
    schema: {};
    macro: {};
    macroFn: {};
    parser: {};
}, {
    [x: string]: {
        get: {
            body: unknown;
            params: {};
            query: unknown;
            headers: unknown;
            response: {
                200: string;
            };
        };
    };
} & {
    api: {
        me: {
            get: {
                body: unknown;
                params: {};
                query: unknown;
                headers: unknown;
                response: {
                    200: {
                        user: {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            email: string;
                            emailVerified: boolean;
                            name: string;
                            image?: string | null | undefined | undefined;
                        };
                        subscription: {
                            isActive: boolean;
                            priceId: string | null;
                            currentPeriodEnd: Date | null;
                        } | null;
                    } | {
                        user: {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            email: string;
                            emailVerified: boolean;
                            name: string;
                            image?: string | null | undefined | undefined;
                        } | null;
                        subscription: null;
                    };
                };
            };
        };
    };
} & {
    api: {
        me: {
            put: {
                body: {
                    name?: string | undefined;
                    image?: string | undefined;
                };
                params: {};
                query: unknown;
                headers: unknown;
                response: {
                    200: {
                        error: string;
                        user?: undefined;
                    } | {
                        user: {
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            email: string;
                            emailVerified: boolean;
                            name: string;
                            image: string | null;
                        };
                        error?: undefined;
                    };
                    422: {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                };
            };
        };
    };
} & {
    api: {
        payment: {
            "create-checkout-session": {
                post: {
                    body: unknown;
                    params: {};
                    query: unknown;
                    headers: unknown;
                    response: {
                        200: {
                            url: string | null;
                            error?: undefined;
                        } | {
                            error: any;
                            url?: undefined;
                        };
                    };
                };
            };
        };
    };
} & {
    api: {
        payment: {
            webhook: {
                post: {
                    body: unknown;
                    params: {};
                    query: unknown;
                    headers: unknown;
                    response: {
                        200: string | {
                            received: boolean;
                            status: string;
                        } | {
                            received: boolean;
                            status?: undefined;
                        };
                    };
                };
            };
        };
    };
} & {
    api: {
        company: {
            get: {
                body: unknown;
                params: {};
                query: unknown;
                headers: unknown;
                response: {
                    200: {
                        error: string;
                        companies?: undefined;
                    } | {
                        companies: {
                            isOwner: boolean;
                            role: string;
                            permissions: string[];
                            hasActiveSubscription: boolean | "" | null;
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            name: string;
                            image: string | null;
                            userId: string;
                            stripeSubscriptionId: string | null;
                            stripePriceId: string | null;
                            stripeCurrentPeriodEnd: Date | null;
                        }[];
                        error?: undefined;
                    };
                };
            };
        };
    };
} & {
    api: {
        company: {
            permissions: {
                get: {
                    body: unknown;
                    params: {};
                    query: unknown;
                    headers: unknown;
                    response: {
                        200: {
                            error: string;
                            permissions?: undefined;
                        } | {
                            permissions: {
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                name: string;
                                desc: string | null;
                            }[];
                            error?: undefined;
                        };
                    };
                };
            };
        };
    };
} & {
    api: {
        company: {
            users: {
                search: {
                    get: {
                        body: unknown;
                        params: {};
                        query: unknown;
                        headers: unknown;
                        response: {
                            200: {
                                error: string;
                                user?: undefined;
                            } | {
                                user: {
                                    id: string;
                                    email: string;
                                    name: string;
                                    image: string | null;
                                };
                                error?: undefined;
                            };
                        };
                    };
                };
            };
        };
    };
} & {
    api: {
        company: {
            name: {
                ":name": {
                    get: {
                        body: unknown;
                        params: {
                            name: string;
                        } & {};
                        query: unknown;
                        headers: unknown;
                        response: {
                            200: {
                                error: string;
                                company?: undefined;
                            } | {
                                company: {
                                    id: string;
                                    name: string;
                                    image: string | null;
                                    isOwner: boolean;
                                    roles: string[];
                                    permissions: string[];
                                    hasActiveSubscription: boolean | "" | null;
                                    currentPeriodEnd: Date | null;
                                };
                                error?: undefined;
                            };
                            422: {
                                type: "validation";
                                on: string;
                                summary?: string;
                                message?: string;
                                found?: unknown;
                                property?: string;
                                expected?: string;
                            };
                        };
                    };
                };
            };
        };
    };
} & {
    api: {
        company: {
            ":id": {
                get: {
                    body: unknown;
                    params: {
                        id: string;
                    } & {};
                    query: unknown;
                    headers: unknown;
                    response: {
                        200: {
                            error: string;
                            company?: undefined;
                        } | {
                            company: {
                                isOwner: boolean;
                                roles: string[];
                                permissions: string[];
                                hasActiveSubscription: boolean | "" | null;
                                members: any[];
                                users: ({
                                    user: {
                                        id: string;
                                        email: string;
                                        name: string;
                                        image: string | null;
                                    };
                                    role: {
                                        id: string;
                                        name: string;
                                    };
                                } & {
                                    id: string;
                                    createdAt: Date;
                                    userId: string;
                                    companyId: string;
                                    roleId: string;
                                })[];
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                name: string;
                                image: string | null;
                                userId: string;
                                stripeCustomerId: string | null;
                                stripeSubscriptionId: string | null;
                                stripePriceId: string | null;
                                stripeCurrentPeriodEnd: Date | null;
                            };
                            error?: undefined;
                        };
                        422: {
                            type: "validation";
                            on: string;
                            summary?: string;
                            message?: string;
                            found?: unknown;
                            property?: string;
                            expected?: string;
                        };
                    };
                };
            };
        };
    };
} & {
    api: {
        company: {
            post: {
                body: {
                    image?: string | undefined;
                    name: string;
                };
                params: {};
                query: unknown;
                headers: unknown;
                response: {
                    200: {
                        error: string;
                        company?: undefined;
                    } | {
                        company: {
                            isOwner: boolean;
                            role: string;
                            hasActiveSubscription: boolean;
                            id: string;
                            createdAt: Date;
                            updatedAt: Date;
                            name: string;
                            image: string | null;
                            userId: string;
                            stripeCustomerId: string | null;
                            stripeSubscriptionId: string | null;
                            stripePriceId: string | null;
                            stripeCurrentPeriodEnd: Date | null;
                        };
                        error?: undefined;
                    };
                    422: {
                        type: "validation";
                        on: string;
                        summary?: string;
                        message?: string;
                        found?: unknown;
                        property?: string;
                        expected?: string;
                    };
                };
            };
        };
    };
} & {
    api: {
        company: {
            ":id": {
                put: {
                    body: {
                        name: string;
                    };
                    params: {
                        id: string;
                    } & {};
                    query: unknown;
                    headers: unknown;
                    response: {
                        200: {
                            error: string;
                            company?: undefined;
                        } | {
                            company: {
                                isOwner: boolean;
                                hasActiveSubscription: boolean | "" | null;
                                id: string;
                                createdAt: Date;
                                updatedAt: Date;
                                name: string;
                                image: string | null;
                                userId: string;
                                stripeCustomerId: string | null;
                                stripeSubscriptionId: string | null;
                                stripePriceId: string | null;
                                stripeCurrentPeriodEnd: Date | null;
                            };
                            error?: undefined;
                        };
                        422: {
                            type: "validation";
                            on: string;
                            summary?: string;
                            message?: string;
                            found?: unknown;
                            property?: string;
                            expected?: string;
                        };
                    };
                };
            };
        };
    };
} & {
    api: {
        company: {
            ":id": {
                delete: {
                    body: unknown;
                    params: {
                        id: string;
                    } & {};
                    query: unknown;
                    headers: unknown;
                    response: {
                        200: {
                            error: string;
                            success?: undefined;
                            message?: undefined;
                        } | {
                            success: boolean;
                            message: string;
                            error?: undefined;
                        };
                        422: {
                            type: "validation";
                            on: string;
                            summary?: string;
                            message?: string;
                            found?: unknown;
                            property?: string;
                            expected?: string;
                        };
                    };
                };
            };
        };
    };
} & {
    api: {
        company: {
            ":id": {
                members: {
                    post: {
                        body: {
                            userId: string;
                            roleIds: string[];
                        };
                        params: {
                            id: string;
                        } & {};
                        query: unknown;
                        headers: unknown;
                        response: {
                            200: {
                                error: string;
                                success?: undefined;
                                message?: undefined;
                            } | {
                                success: boolean;
                                message: string;
                                error?: undefined;
                            };
                            422: {
                                type: "validation";
                                on: string;
                                summary?: string;
                                message?: string;
                                found?: unknown;
                                property?: string;
                                expected?: string;
                            };
                        };
                    };
                };
            };
        };
    };
} & {
    api: {
        company: {
            ":id": {
                members: {
                    ":userId": {
                        put: {
                            body: {
                                roleId: string;
                            };
                            params: {
                                id: string;
                                userId: string;
                            } & {};
                            query: unknown;
                            headers: unknown;
                            response: {
                                200: {
                                    error: string;
                                    success?: undefined;
                                    message?: undefined;
                                } | {
                                    success: boolean;
                                    message: string;
                                    error?: undefined;
                                };
                                422: {
                                    type: "validation";
                                    on: string;
                                    summary?: string;
                                    message?: string;
                                    found?: unknown;
                                    property?: string;
                                    expected?: string;
                                };
                            };
                        };
                    };
                };
            };
        };
    };
} & {
    api: {
        company: {
            ":id": {
                members: {
                    ":userId": {
                        delete: {
                            body: unknown;
                            params: {
                                id: string;
                                userId: string;
                            } & {};
                            query: unknown;
                            headers: unknown;
                            response: {
                                200: {
                                    error: string;
                                    success?: undefined;
                                    message?: undefined;
                                } | {
                                    success: boolean;
                                    message: string;
                                    error?: undefined;
                                };
                                422: {
                                    type: "validation";
                                    on: string;
                                    summary?: string;
                                    message?: string;
                                    found?: unknown;
                                    property?: string;
                                    expected?: string;
                                };
                            };
                        };
                    };
                };
            };
        };
    };
} & {
    api: {
        company: {
            ":id": {
                roles: {
                    get: {
                        body: unknown;
                        params: {
                            id: string;
                        } & {};
                        query: unknown;
                        headers: unknown;
                        response: {
                            200: {
                                error: string;
                                roles?: undefined;
                            } | {
                                roles: ({
                                    permissions: {
                                        id: string;
                                        name: string;
                                        desc: string | null;
                                    }[];
                                } & {
                                    id: string;
                                    createdAt: Date;
                                    updatedAt: Date;
                                    name: string;
                                    companyId: string;
                                })[];
                                error?: undefined;
                            };
                            422: {
                                type: "validation";
                                on: string;
                                summary?: string;
                                message?: string;
                                found?: unknown;
                                property?: string;
                                expected?: string;
                            };
                        };
                    };
                };
            };
        };
    };
} & {
    api: {
        company: {
            ":id": {
                roles: {
                    ":roleId": {
                        get: {
                            body: unknown;
                            params: {
                                id: string;
                                roleId: string;
                            } & {};
                            query: unknown;
                            headers: unknown;
                            response: {
                                200: {
                                    error: string;
                                    role?: undefined;
                                } | {
                                    role: {
                                        users: {
                                            joinedAt: Date;
                                            id: string;
                                            email: string;
                                            name: string;
                                            image: string | null;
                                        }[];
                                        permissions: {
                                            id: string;
                                            name: string;
                                            desc: string | null;
                                        }[];
                                        id: string;
                                        createdAt: Date;
                                        updatedAt: Date;
                                        name: string;
                                        companyId: string;
                                    };
                                    error?: undefined;
                                };
                                422: {
                                    type: "validation";
                                    on: string;
                                    summary?: string;
                                    message?: string;
                                    found?: unknown;
                                    property?: string;
                                    expected?: string;
                                };
                            };
                        };
                    };
                };
            };
        };
    };
} & {
    api: {
        company: {
            ":id": {
                roles: {
                    post: {
                        body: {
                            permissionIds?: string[] | undefined;
                            name: string;
                        };
                        params: {
                            id: string;
                        } & {};
                        query: unknown;
                        headers: unknown;
                        response: {
                            200: {
                                error: string;
                                role?: undefined;
                            } | {
                                role: {
                                    permissions: {
                                        id: string;
                                        name: string;
                                        desc: string | null;
                                    }[];
                                } & {
                                    id: string;
                                    createdAt: Date;
                                    updatedAt: Date;
                                    name: string;
                                    companyId: string;
                                };
                                error?: undefined;
                            };
                            422: {
                                type: "validation";
                                on: string;
                                summary?: string;
                                message?: string;
                                found?: unknown;
                                property?: string;
                                expected?: string;
                            };
                        };
                    };
                };
            };
        };
    };
} & {
    api: {
        company: {
            ":id": {
                roles: {
                    ":roleId": {
                        put: {
                            body: {
                                permissionIds?: string[] | undefined;
                                name: string;
                            };
                            params: {
                                id: string;
                                roleId: string;
                            } & {};
                            query: unknown;
                            headers: unknown;
                            response: {
                                200: {
                                    error: string;
                                    role?: undefined;
                                } | {
                                    role: {
                                        permissions: {
                                            id: string;
                                            name: string;
                                            desc: string | null;
                                        }[];
                                    } & {
                                        id: string;
                                        createdAt: Date;
                                        updatedAt: Date;
                                        name: string;
                                        companyId: string;
                                    };
                                    error?: undefined;
                                };
                                422: {
                                    type: "validation";
                                    on: string;
                                    summary?: string;
                                    message?: string;
                                    found?: unknown;
                                    property?: string;
                                    expected?: string;
                                };
                            };
                        };
                    };
                };
            };
        };
    };
} & {
    api: {
        company: {
            ":id": {
                roles: {
                    ":roleId": {
                        delete: {
                            body: unknown;
                            params: {
                                id: string;
                                roleId: string;
                            } & {};
                            query: unknown;
                            headers: unknown;
                            response: {
                                200: {
                                    error: string;
                                    success?: undefined;
                                    message?: undefined;
                                } | {
                                    success: boolean;
                                    message: string;
                                    error?: undefined;
                                };
                                422: {
                                    type: "validation";
                                    on: string;
                                    summary?: string;
                                    message?: string;
                                    found?: unknown;
                                    property?: string;
                                    expected?: string;
                                };
                            };
                        };
                    };
                };
            };
        };
    };
}, {
    derive: {};
    resolve: {};
    schema: {};
    standaloneSchema: {};
    response: {};
}, {
    derive: {};
    resolve: {};
    schema: {};
    standaloneSchema: {};
    response: {};
} & {
    derive: {};
    resolve: {};
    schema: {};
    standaloneSchema: {};
    response: {};
} & {
    derive: {};
    resolve: {};
    schema: {};
} & {
    derive: {};
    resolve: {};
    schema: {};
    standaloneSchema: {};
    response: {};
}>;
export type App = typeof app;
export {};
