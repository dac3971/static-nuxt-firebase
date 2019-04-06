export default function ({
    query,
    redirect
}) {
    if (!query.v) {
        redirect('/account/login?a=1')
    }
}