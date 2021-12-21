export function contains(transformApplication, transformApplications) {
    for (let i = 0; i < transformApplications.length; i++) {
        if (transformApplication.transform.name ==
            transformApplications[i].transform.name) {
            return true;
        }
    }
    return false;
}
