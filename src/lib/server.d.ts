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
        } & {
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
        } & {
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
        } & {
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
        } & {
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
        } & {
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
        } & {
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
                land: {
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
                                lands?: undefined;
                            } | {
                                lands: {
                                    id: string;
                                    updatedAt: Date;
                                    name: string;
                                    companyId: string;
                                    areaHectares: number;
                                    latitude: number;
                                    longitude: number;
                                    location: string;
                                    geoPolygon: string;
                                    isDeforestationFree: boolean | null;
                                    recordedAt: Date;
                                }[];
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
            ":id": {
                land: {
                    ":landId": {
                        get: {
                            body: unknown;
                            params: {
                                id: string;
                                landId: string;
                            } & {};
                            query: unknown;
                            headers: unknown;
                            response: {
                                200: {
                                    error: string;
                                    land?: undefined;
                                } | {
                                    land: {
                                        company: {
                                            id: string;
                                            name: string;
                                        };
                                    } & {
                                        id: string;
                                        updatedAt: Date;
                                        name: string;
                                        companyId: string;
                                        areaHectares: number;
                                        latitude: number;
                                        longitude: number;
                                        location: string;
                                        geoPolygon: string;
                                        isDeforestationFree: boolean | null;
                                        recordedAt: Date;
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
            ":id": {
                land: {
                    post: {
                        body: {
                            isDeforestationFree?: boolean | undefined;
                            name: string;
                            areaHectares: number;
                            latitude: number;
                            longitude: number;
                            location: string;
                            geoPolygon: string;
                        };
                        params: {
                            id: string;
                        } & {};
                        query: unknown;
                        headers: unknown;
                        response: {
                            200: {
                                error: string;
                                land?: undefined;
                            } | {
                                land: {
                                    id: string;
                                    updatedAt: Date;
                                    name: string;
                                    companyId: string;
                                    areaHectares: number;
                                    latitude: number;
                                    longitude: number;
                                    location: string;
                                    geoPolygon: string;
                                    isDeforestationFree: boolean | null;
                                    recordedAt: Date;
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
            ":id": {
                land: {
                    ":landId": {
                        put: {
                            body: {
                                name?: string | undefined;
                                areaHectares?: number | undefined;
                                latitude?: number | undefined;
                                longitude?: number | undefined;
                                location?: string | undefined;
                                geoPolygon?: string | undefined;
                                isDeforestationFree?: boolean | undefined;
                            };
                            params: {
                                id: string;
                                landId: string;
                            } & {};
                            query: unknown;
                            headers: unknown;
                            response: {
                                200: {
                                    error: string;
                                    land?: undefined;
                                } | {
                                    land: {
                                        id: string;
                                        updatedAt: Date;
                                        name: string;
                                        companyId: string;
                                        areaHectares: number;
                                        latitude: number;
                                        longitude: number;
                                        location: string;
                                        geoPolygon: string;
                                        isDeforestationFree: boolean | null;
                                        recordedAt: Date;
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
            ":id": {
                land: {
                    ":landId": {
                        delete: {
                            body: unknown;
                            params: {
                                id: string;
                                landId: string;
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
                worker: {
                    individual: {
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
                                    farmers?: undefined;
                                } | {
                                    farmers: {
                                        farmerGroups: {
                                            id: string;
                                            name: string;
                                        }[];
                                        id: string;
                                        createdAt: Date;
                                        updatedAt: Date;
                                        companyId: string;
                                        firstName: string;
                                        lastName: string;
                                        nationalId: string;
                                        phoneNumber: string;
                                        address: string;
                                    }[];
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
            ":id": {
                worker: {
                    individual: {
                        ":farmerId": {
                            get: {
                                body: unknown;
                                params: {
                                    id: string;
                                    farmerId: string;
                                } & {};
                                query: unknown;
                                headers: unknown;
                                response: {
                                    200: {
                                        error: string;
                                        farmer?: undefined;
                                    } | {
                                        farmer: {
                                            farmerGroups: {
                                                id: string;
                                                name: string;
                                            }[];
                                            id: string;
                                            createdAt: Date;
                                            updatedAt: Date;
                                            companyId: string;
                                            firstName: string;
                                            lastName: string;
                                            nationalId: string;
                                            phoneNumber: string;
                                            address: string;
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
            ":id": {
                worker: {
                    individual: {
                        post: {
                            body: {
                                farmerGroupIds?: string[] | undefined;
                                firstName: string;
                                lastName: string;
                                nationalId: string;
                                phoneNumber: string;
                                address: string;
                            };
                            params: {
                                id: string;
                            } & {};
                            query: unknown;
                            headers: unknown;
                            response: {
                                200: {
                                    error: string;
                                    farmer?: undefined;
                                } | {
                                    farmer: {
                                        farmerGroups: {
                                            id: string;
                                            name: string;
                                        }[];
                                        id: string;
                                        createdAt: Date;
                                        updatedAt: Date;
                                        companyId: string;
                                        firstName: string;
                                        lastName: string;
                                        nationalId: string;
                                        phoneNumber: string;
                                        address: string;
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
            ":id": {
                worker: {
                    individual: {
                        ":farmerId": {
                            put: {
                                body: {
                                    firstName?: string | undefined;
                                    lastName?: string | undefined;
                                    nationalId?: string | undefined;
                                    phoneNumber?: string | undefined;
                                    address?: string | undefined;
                                    farmerGroupIds?: string[] | undefined;
                                };
                                params: {
                                    id: string;
                                    farmerId: string;
                                } & {};
                                query: unknown;
                                headers: unknown;
                                response: {
                                    200: {
                                        error: string;
                                        farmer?: undefined;
                                    } | {
                                        farmer: {
                                            farmerGroups: {
                                                id: string;
                                                name: string;
                                            }[];
                                            id: string;
                                            createdAt: Date;
                                            updatedAt: Date;
                                            companyId: string;
                                            firstName: string;
                                            lastName: string;
                                            nationalId: string;
                                            phoneNumber: string;
                                            address: string;
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
            ":id": {
                worker: {
                    individual: {
                        ":farmerId": {
                            delete: {
                                body: unknown;
                                params: {
                                    id: string;
                                    farmerId: string;
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
            ":id": {
                worker: {
                    group: {
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
                                    farmerGroups?: undefined;
                                } | {
                                    farmerGroups: {
                                        farmers: {
                                            id: string;
                                            firstName: string;
                                            lastName: string;
                                            nationalId: string;
                                        }[];
                                        id: string;
                                        createdAt: Date;
                                        updatedAt: Date;
                                        name: string;
                                        companyId: string;
                                    }[];
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
            ":id": {
                worker: {
                    group: {
                        ":groupId": {
                            get: {
                                body: unknown;
                                params: {
                                    id: string;
                                    groupId: string;
                                } & {};
                                query: unknown;
                                headers: unknown;
                                response: {
                                    200: {
                                        error: string;
                                        farmerGroup?: undefined;
                                    } | {
                                        farmerGroup: {
                                            farmers: {
                                                id: string;
                                                firstName: string;
                                                lastName: string;
                                                nationalId: string;
                                                phoneNumber: string;
                                                address: string;
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
        } & {
            ":id": {
                worker: {
                    group: {
                        post: {
                            body: {
                                farmerIds?: string[] | undefined;
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
                                    farmerGroup?: undefined;
                                } | {
                                    farmerGroup: {
                                        farmers: {
                                            id: string;
                                            firstName: string;
                                            lastName: string;
                                            nationalId: string;
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
        } & {
            ":id": {
                worker: {
                    group: {
                        ":groupId": {
                            put: {
                                body: {
                                    name?: string | undefined;
                                    farmerIds?: string[] | undefined;
                                };
                                params: {
                                    id: string;
                                    groupId: string;
                                } & {};
                                query: unknown;
                                headers: unknown;
                                response: {
                                    200: {
                                        error: string;
                                        farmerGroup?: undefined;
                                    } | {
                                        farmerGroup: {
                                            farmers: {
                                                id: string;
                                                firstName: string;
                                                lastName: string;
                                                nationalId: string;
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
        } & {
            ":id": {
                worker: {
                    group: {
                        ":groupId": {
                            delete: {
                                body: unknown;
                                params: {
                                    id: string;
                                    groupId: string;
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
    };
} & {
    api: {
        company: {
            ":id": {
                commodity: {
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
                                commodities?: undefined;
                            } | {
                                commodities: ({
                                    batches: {
                                        id: string;
                                        lotCode: string;
                                        harvestDate: Date;
                                        totalKg: number;
                                    }[];
                                } & {
                                    id: string;
                                    createdAt: Date;
                                    name: string;
                                    code: string;
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
        } & {
            ":id": {
                commodity: {
                    ":commodityId": {
                        get: {
                            body: unknown;
                            params: {
                                id: string;
                                commodityId: string;
                            } & {};
                            query: unknown;
                            headers: unknown;
                            response: {
                                200: {
                                    error: string;
                                    commodity?: undefined;
                                } | {
                                    commodity: {
                                        batches: ({
                                            batchSources: ({
                                                land: {
                                                    id: string;
                                                    name: string;
                                                    location: string;
                                                };
                                                farmerGroup: {
                                                    id: string;
                                                    name: string;
                                                };
                                            } & {
                                                id: string;
                                                createdAt: Date;
                                                landId: string;
                                                farmerGroupId: string;
                                                batchId: string;
                                                volumeKg: number;
                                                landSnapshot: import("@prisma/client/runtime/client").JsonValue;
                                            })[];
                                            batchAttributes: {
                                                id: string;
                                                recordedAt: Date;
                                                key: string;
                                                value: string;
                                                unit: string | null;
                                            }[];
                                        } & {
                                            id: string;
                                            createdAt: Date;
                                            commodityId: string;
                                            lotCode: string;
                                            harvestDate: Date;
                                            totalKg: number;
                                        })[];
                                    } & {
                                        id: string;
                                        createdAt: Date;
                                        name: string;
                                        code: string;
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
            ":id": {
                commodity: {
                    post: {
                        body: {
                            name: string;
                            code: string;
                        };
                        params: {
                            id: string;
                        } & {};
                        query: unknown;
                        headers: unknown;
                        response: {
                            200: {
                                error: string;
                                commodity?: undefined;
                            } | {
                                commodity: {
                                    batches: {
                                        id: string;
                                        lotCode: string;
                                        harvestDate: Date;
                                        totalKg: number;
                                    }[];
                                } & {
                                    id: string;
                                    createdAt: Date;
                                    name: string;
                                    code: string;
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
            ":id": {
                commodity: {
                    ":commodityId": {
                        put: {
                            body: {
                                name?: string | undefined;
                                code?: string | undefined;
                            };
                            params: {
                                id: string;
                                commodityId: string;
                            } & {};
                            query: unknown;
                            headers: unknown;
                            response: {
                                200: {
                                    error: string;
                                    commodity?: undefined;
                                } | {
                                    commodity: {
                                        batches: {
                                            id: string;
                                            lotCode: string;
                                            harvestDate: Date;
                                            totalKg: number;
                                        }[];
                                    } & {
                                        id: string;
                                        createdAt: Date;
                                        name: string;
                                        code: string;
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
            ":id": {
                commodity: {
                    ":commodityId": {
                        delete: {
                            body: unknown;
                            params: {
                                id: string;
                                commodityId: string;
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
