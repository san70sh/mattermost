// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

/**
 * @param {Post} originalPost
 * @returns {NewActionFuncAsync<Post>}
 */
export function runMessageWillBePostedHooks(originalPost) {
    return async (dispatch, getState) => {
        const hooks = getState().plugins.components.MessageWillBePosted;
        if (!hooks || hooks.length === 0) {
            return {data: originalPost};
        }

        let post = originalPost;

        for (const hook of hooks) {
            const result = await hook.hook(post); // eslint-disable-line no-await-in-loop

            if (result) {
                if (result.error) {
                    return {
                        error: result.error,
                    };
                }

                post = result.post;
            }
        }

        return {data: post};
    };
}

export function runSlashCommandWillBePostedHooks(originalMessage, originalArgs) {
    return async (dispatch, getState) => {
        const hooks = getState().plugins.components.SlashCommandWillBePosted;
        if (!hooks || hooks.length === 0) {
            return {data: {message: originalMessage, args: originalArgs}};
        }

        let message = originalMessage;
        let args = originalArgs;

        for (const hook of hooks) {
            const result = await hook.hook(message, args); // eslint-disable-line no-await-in-loop

            if (result) {
                if (result.error) {
                    return {
                        error: result.error,
                    };
                }

                message = result.message;
                args = result.args;

                // The first plugin to consume the slash command by returning an empty object
                // should terminate the processing by subsequent plugins.
                if (Object.keys(result).length === 0) {
                    break;
                }
            }
        }

        return {data: {message, args}};
    };
}

export function runMessageWillBeUpdatedHooks(newPost, oldPost) {
    return async (dispatch, getState) => {
        const hooks = getState().plugins.components.MessageWillBeUpdated;
        if (!hooks || hooks.length === 0) {
            return {data: newPost};
        }

        let post = newPost;

        for (const hook of hooks) {
            const result = await hook.hook(post, oldPost); // eslint-disable-line no-await-in-loop

            if (result) {
                if (result.error) {
                    return {
                        error: result.error,
                    };
                }

                post = result.post;
            }
        }

        return {data: post};
    };
}

export function runDesktopNotificationHooks(post, msgProps, channel, teamId, args) {
    return async (dispatch, getState) => {
        const hooks = getState().plugins.components.DesktopNotificationHooks;
        if (!hooks || hooks.length === 0) {
            return {args};
        }

        let nextArgs = args;
        for (const hook of hooks) {
            const result = await hook.hook(post, msgProps, channel, teamId, nextArgs); // eslint-disable-line no-await-in-loop

            if (result) {
                if (result.error) {
                    return {error: result.error};
                }

                if (!result.args) {
                    return {error: 'returned empty args'};
                }

                nextArgs = result.args;
            }
        }

        return {args: nextArgs};
    };
}
