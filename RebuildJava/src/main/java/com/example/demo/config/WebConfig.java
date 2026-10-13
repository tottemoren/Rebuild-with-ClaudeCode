package com.example.demo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
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

    // 各コントローラーの @CrossOrigin と同じ、フロントエンドの配信元
    private static final String[] FRONTEND_ORIGINS = {
            "http://localhost:5173",
            "https://d7a89hxno1ipb.cloudfront.net",
            "https://mangarebuild.com",
            "https://www.mangarebuild.com"
    };

    @Value("${file.upload-dir}")
    private String uploadDir;

    /**
     * 漫画作成画面の「画像として保存」は、アップロードした素材をブラウザ内のキャンバスに描いて
     * PNGに変換する。別のオリジンの画像を使うには、配信側が読み込みを許可している必要があるため、
     * /uploads/** の読み込み（GET）だけをフロントエンドの配信元に許可する。
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {

        registry
                .addMapping("/uploads/**")
                .allowedOrigins(FRONTEND_ORIGINS)
                .allowedMethods("GET");
    }

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
