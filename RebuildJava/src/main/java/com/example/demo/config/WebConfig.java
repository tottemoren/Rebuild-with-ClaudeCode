package com.example.demo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * アップロードされたプロフィール画像を、通常の静的ファイルと同じように
 * ブラウザから直接 <img src="http://localhost:8080/uploads/profile-images/xxx.png">
 * のようなURLで参照できるようにするための設定。
 *
 * file.upload-dir で指定したディレクトリ（アプリ起動ディレクトリからの相対パス）を
 * "/uploads/**" というURLパスにマッピングする。
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        // file.upload-dir = uploads/profile-images なので、
        // 公開URLは /uploads/profile-images/... ではなく
        // 親ディレクトリ uploads/ 以下をまとめて公開する
        String location = "file:" + parentDir(uploadDir) + "/";

        registry
                .addResourceHandler("/uploads/**")
                .addResourceLocations(location);
    }

    private String parentDir(String dir) {

        int lastSlash = dir.lastIndexOf('/');

        if (lastSlash < 0) {
            return dir;
        }

        return dir.substring(0, lastSlash);
    }
}
