export function contains(transformApplication, transformApplications) {
    for (let i = 0; i < transformApplications.length; i++) {
        if (transformApplication.name == transformApplications[i].name) {
            return true;
        }
    }
    return false;
}
