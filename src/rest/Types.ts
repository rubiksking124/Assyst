/* eslint-disable camelcase */
export namespace GitHub {

    export namespace CommitInfo {
        export interface Welcome {
            url: string;
            sha: string;
            node_id: string;
            html_url: string;
            comments_url: string;
            commit: Commit;
            author: WelcomeAuthor;
            committer: WelcomeAuthor;
            parents: Tree[];
        }

        export interface WelcomeAuthor {
            login: string;
            id: number;
            node_id: string;
            avatar_url: string;
            gravatar_id: string;
            url: string;
            html_url: string;
            followers_url: string;
            following_url: string;
            gists_url: string;
            starred_url: string;
            subscriptions_url: string;
            organizations_url: string;
            repos_url: string;
            events_url: string;
            received_events_url: string;
            type: string;
            site_admin: boolean;
        }

        export interface Commit {
            url: string;
            author: Author;
            committer: Author;
            message: string;
            tree: Tree;
            comment_count: number;
            verification: Verification;
        }

        export interface Author {
            name: string;
            email: string;
            date: Date;
        }

        export interface Tree {
            url: string;
            sha: string;
        }

        export interface Verification {
            verified: boolean;
            reason: string;
            signature: null;
            payload: null;
        }
    }

    export namespace User {
        export interface SearchItem {
            login: string,
            id: number,
            node_id: string,
            avatar_url: string,
            gravatar_id: string,
            url: string,
            html_url: string,
            followers_url: string,
            following_url: string,
            gists_url: string,
            starred_url: string,
            subscriptions_url: string,
            repos_url: string
            events_url: string,
            recieved_events_url: string,
            type: 'User' | 'Organisation',
            site_admin: boolean,
            score: number
        }

        export interface SearchResult {
            total_count: number,
            incomplete_results: false,
            items: SearchItem[]
        }

        export interface SearchOptions {
            sort?: 'followers' | 'repositories' | 'joined',
            order?: 'desc' | 'asc'
        }

        export interface User {
            login: string;
            id: number;
            node_id: string;
            avatar_url: string;
            gravatar_id: string;
            url: string;
            html_url: string;
            followers_url: string;
            following_url: string;
            gists_url: string;
            starred_url: string;
            subscriptions_url: string;
            organizations_url: string;
            repos_url: string;
            events_url: string;
            received_events_url: string;
            type: string;
            site_admin: boolean;
            name: string;
            company: string;
            blog: string;
            location: string;
            email: string;
            hireable: boolean;
            bio: string;
            public_repos: number;
            public_gists: number;
            followers: number;
            following: number;
            created_at: Date;
            updated_at: Date;
        }
    }

    export namespace Repository {
        export interface SearchItem {
            id: number,
            node_id: string,
            name: string,
            full_name: string,
            private: string,
            owner: GitHub.User.User,
            html_url: string,
            description: string,
            fork: boolean,
            url: string,
            forks_url: string,
            keys_url: string,
            collaborators_url: string,
            teams_url: string,
            hooks_url: string,
            issue_events_url: string,
            events_url: string,
            assignees_url: string,
            branches_url: string,
            tags_url: string,
            git_tags_url: string,
            git_refs_url: string,
            trees_url: string,
            statuses_url: string,
            languages_url: string,
            stargazers_url: string,
            contributors_url: string,
            subscribers_url: string,
            subscription_url: string,
            commits_url: string,
            git_commits_url: string,
            comments_url: string,
            issue_comment_url: string,
            contents_url: string,
            compare_url: string,
            merges_url: string,
            archive_url: string,
            downloads_url: string,
            issues_url: string,
            pulls_url: string,
            milestones_url: string,
            labels_url: string,
            releases_url: string,
            deployments_url: string,
            created_at: Date,
            updated_at: Date,
            pushed_at: Date,
            homepage: string,
            size: number,
            stargazers_count: number,
            watchers_count: number,
            language: string,
            forks_count: number,
            open_issues_count: number,
            master_branch: string,
            default_branch: string,
            score: number
        }

        export interface SearchResult {
            total_count: number,
            incomplete_results: false,
            items: SearchItem[]
        }

        export interface SearchOptions {
            sort?: 'stars' | 'forks' | 'help-wanted-issues',
            order?: 'desc' | 'asc'
        }
    }

    export interface NotFound {
        message: string,
        documentation_url: string
    }
}

export namespace Zx8 {

    export interface Node {
        id: number,
        host: string,
        port: number,
        ssl: false,
        ping: number,
        memory: number,
        available: boolean,
        queue: number
    }

    export interface Info {
        urlQueue: number,
        totalURLs: number,
        rss: number,
        tableSize: number,
        queryCache: number,
        indexesPerSecond: number
    }

    export interface Dataset {
        url: string,
        host: string,
        lastStatus: number,
        headers: string,
        lastRequest: string,
        lastResponseTime: number
    }

    export enum ContentType {
        Other,
        Image,
        Animated,
        Video,
        HTML
    }
}

export namespace History {
    export interface ApiResult {
        wikipedia: string,
        date: string,
        events: Event[]
    }

    export interface Event {
        year: string,
        description: string,
        wikipedia: Wikipedia[]
    }

    export interface Wikipedia {
        title: string,
        wikipedia: string
    }
}

export namespace DuckDuckGo {
    export interface Response {
        results: Result[]
    }

    export interface Result {
        title: string,
        link: string
    }
}

export namespace GoCodeIt {
    export interface CodeList {
        status: number,
        data: Array<string>
    }

    export interface CodeResult {
        data: {
            res: string,
            comp: number,
            timings: any[]
        },
        status: number
    }
}

export namespace BotLists {
    export interface PostResults {
        dbl: any, // todo
        discordbotlist: any // todo
    }
}

export namespace Translate {
    export const Languages = [
        'az',
        'sq',
        'am',
        'ar',
        'hy',
        'af',
        'eu',
        'ml',
        'mt',
        'mk',
        'mi',
        'mr',
        'mhr',
        'mn',
        'de',
        'ba',
        'be',
        'bn',
        'my',
        'bg',
        'bs',
        'cy',
        'hu',
        'vi',
        'ht',
        'gl',
        'nl',
        'mrj',
        'ne',
        'no',
        'pa',
        'pap',
        'fa',
        'pl',
        'pt',
        'ro',
        'ru',
        'ceb',
        'sr',
        'si',
        'sk',
        'el',
        'ka',
        'gu',
        'da',
        'he',
        'yi',
        'id',
        'ga',
        'it',
        'is',
        'es',
        'kk',
        'kn',
        'sl',
        'sw',
        'su',
        'tg',
        'th',
        'tl',
        'ta',
        'tt',
        'te',
        'te',
        'tr',
        'udm',
        'uk',
        'uk',
        'ca',
        'ky',
        'zh',
        'ko',
        'xh',
        'km',
        'lo',
        'la',
        'lv',
        'lt',
        'lb',
        'mg',
        'ms',
        'ur',
        'fi',
        'fr',
        'hi',
        'hr',
        'cd',
        'sv',
        'gd',
        'et',
        'eo',
        'jv',
        'ja'
    ]
    export interface RawTranslation {
        code: number,
        lang: string,
        text: string[]
    }
    export interface Translation {
        chain: string[]
        text: string
    }
}