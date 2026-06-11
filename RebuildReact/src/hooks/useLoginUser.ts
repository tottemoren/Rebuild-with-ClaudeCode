import type { User } from "../types/User";

function useLoginUser(): User {

    const loginUser =
        JSON.parse(
            localStorage.getItem(
                "loginUser"
        ) || "{}"
        );
    return loginUser;

}

export default useLoginUser;